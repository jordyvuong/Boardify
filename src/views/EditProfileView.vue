<template>
    <div class="edit-profile-container">
      <h1>Modifier le profil</h1>
      <form @submit.prevent="saveProfile">
        <!-- Nom d'utilisateur -->
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
  
        <!-- Photo -->
        <div class="form-group">
          <label for="photoURL">Photo de profil</label>
          <input 
            type="file" 
            id="photoURL" 
            accept="image/*" 
            @change="handleFileChange" 
          />
          <img 
            v-if="previewPhoto" 
            :src="previewPhoto" 
            alt="Aperçu" 
            class="photo-preview" 
          />
        </div>
  
        <!-- Mot de passe actuel -->
        <div class="form-group">
          <label for="currentPassword">Mot de passe actuel</label>
          <input
            type="password"
            id="currentPassword"
            v-model="currentPassword"
            placeholder="Entrez votre mot de passe actuel"
          />
        </div>
  
        <!-- Nouveau mot de passe -->
        <div class="form-group">
          <label for="newPassword">Nouveau mot de passe</label>
          <input
            type="password"
            id="newPassword"
            v-model="newPassword"
            placeholder="Nouveau mot de passe"
            minlength="6"
          />
        </div>
  
        <!-- Confirmer le mot de passe -->
        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirmer le nouveau mot de passe"
            minlength="6"
          />
        </div>
  
        <button 
          type="submit" 
          :disabled="loading || (newPassword && (!currentPassword || newPassword !== confirmPassword))"
        >
          {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { db, auth } from '@/firebase'
  import { ref as dbRef, update } from 'firebase/database'
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
  import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const displayName = ref(authStore.user?.displayName || '')
  const photoFile = ref(null)
  const previewPhoto = ref(authStore.user?.photoURL || '')
  const loading = ref(false)
  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  
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
  
      // Vérifier et mettre à jour le mot de passe si nécessaire
      if (newPassword.value) {
        if (newPassword.value !== confirmPassword.value) {
          throw new Error('Les mots de passe ne correspondent pas')
        }
        if (newPassword.value.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères')
        }
  
        // Réauthentifier l'utilisateur
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          currentPassword.value
        )
        await reauthenticateWithCredential(auth.currentUser, credential)
        
        // Mettre à jour le mot de passe
        await updatePassword(auth.currentUser, newPassword.value)
      }
  
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
      authStore.user = { ...authStore.user, ...updates }
      
      // Réinitialiser les champs de mot de passe
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      
      alert('Profil mis à jour avec succès !')
    } catch (error) {
      console.error('Error updating profile:', error)
      if (error.code === 'auth/wrong-password') {
        alert('Le mot de passe actuel est incorrect.')
      } else {
        alert(error.message || 'Une erreur est survenue lors de la mise à jour du profil.')
      }
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
  input[type='password'],
  input[type='file'] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input[type='password'] {
    background-color: white;
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
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #026aa7;
  }
  
  button:disabled {
    background-color: #a5c7d8;
    cursor: not-allowed;
  }
  </style>