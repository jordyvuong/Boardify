<template>
  <div class="edit-profile-container">
    <h1>Modifier le profil</h1>
    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label for="displayName">Nom d'utilisateur</label>
        <input
          type="text"
          id="displayName"
          v-model="displayName"
          placeholder="Nom d'utilisateur"
          required
        />
      </div>

      <div class="form-group">
        <label for="photoURL">Photo de profil</label>
        <input type="file" id="photoURL" accept="image/*" @change="handleFileChange" />
        <img v-if="previewPhoto" :src="previewPhoto" alt="Aperçu" class="photo-preview" />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
      </button>
    </form>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import { ref as dbRef, update } from 'firebase/database'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const authStore = useAuthStore()
const displayName = ref(authStore.user?.displayName || '')
const photoFile = ref(null)
const previewPhoto = ref(authStore.user?.photoURL || '')
const loading = ref(false)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    photoFile.value = file
    previewPhoto.value = URL.createObjectURL(file)
  } else {
    photoFile.value = null
    previewPhoto.value = ''
    alert('Veuillez sélectionner un fichier image valide.')
  }
}

const saveProfile = async () => {
  try {
    loading.value = true
    const updates = { displayName: displayName.value }
    let photoURL = authStore.user?.photoURL || ''

    // Upload photo si sélectionnée
    if (photoFile.value) {
      const storage = getStorage()
      const fileRef = storageRef(storage, `profilePictures/${authStore.user.uid}.jpg`)
      await uploadBytes(fileRef, photoFile.value)
      photoURL = await getDownloadURL(fileRef)
      updates.photoURL = photoURL
    }

    // Mettre à jour la DB
    const userRef = dbRef(db, `users/${authStore.user.uid}`)
    await update(userRef, updates)

    // Mettre à jour le store local
    authStore.user = { ...authStore.user, ...updates, photoURL }
    alert('Profil mis à jour avec succès !')
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Une erreur est survenue lors de la mise à jour du profil.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-profile-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input[type='text'],
input[type='file'] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.photo-preview {
  display: block;
  margin-top: 1rem;
  max-width: 100px;
  border-radius: 50%;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background-color: #a5c7d8;
  cursor: not-allowed;
}
</style>
