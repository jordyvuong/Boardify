<template>
    <div class="edit-profile-container">
      <h1>Modifier le profil</h1>
  
      <!-- Photo de profil centrée -->
      <div class="profile-photo-container">
        <div class="profile-photo-wrapper">
          <img 
            v-if="previewPhoto" 
            :src="previewPhoto" 
            alt="Photo de profil" 
            class="profile-photo" 
          />
          <div v-else class="profile-photo-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div class="photo-upload-overlay">
            <label for="photoURL" class="photo-upload-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
              Changer
            </label>
          </div>
        </div>
        <input 
          type="file" 
          id="photoURL" 
          accept="image/*" 
          @change="handleFileChange"
          class="photo-upload-input"
        />
      </div>
  
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
  
        <!-- Section mot de passe -->
        <div class="password-section">
          <button 
            type="button" 
            class="toggle-password-btn" 
            @click="showPasswordFields = !showPasswordFields"
          >
            <span v-if="!showPasswordFields">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Modifier le mot de passe
            </span>
            <span v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="m8 11 4-4 4 4"></path></svg>
              Masquer les champs de mot de passe
            </span>
          </button>
  
          <transition name="slide">
            <div v-if="showPasswordFields" class="password-fields">
              <!-- Mot de passe actuel -->
              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <div class="password-input-container">
                  <input
                    :type="showCurrentPassword ? 'text' : 'password'"
                    id="currentPassword"
                    v-model="currentPassword"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button 
                    type="button" 
                    class="toggle-visibility" 
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <svg v-if="showCurrentPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </div>
  
              <!-- Nouveau mot de passe -->
              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <div class="password-input-container">
                  <input
                    :type="showNewPassword ? 'text' : 'password'"
                    id="newPassword"
                    v-model="newPassword"
                    placeholder="Nouveau mot de passe"
                    minlength="6"
                  />
                  <button 
                    type="button" 
                    class="toggle-visibility" 
                    @click="showNewPassword = !showNewPassword"
                  >
                    <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
                <div v-if="newPassword" class="password-strength">
                  <div class="strength-meter">
                    <div 
                      class="strength-bar" 
                      :style="{ width: passwordStrength.score * 25 + '%' }"
                      :class="passwordStrength.class"
                    ></div>
                  </div>
                  <span class="strength-text" :class="passwordStrength.class">
                    {{ passwordStrength.text }}
                  </span>
                </div>
              </div>
  
              <!-- Confirmer le mot de passe -->
              <div class="form-group">
                <label for="confirmPassword">Confirmer le mot de passe</label>
                <div class="password-input-container">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    placeholder="Confirmer le nouveau mot de passe"
                    minlength="6"
                  />
                  <button 
                    type="button" 
                    class="toggle-visibility" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
                <div v-if="confirmPassword && newPassword !== confirmPassword" class="password-mismatch">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>
          </transition>
        </div>
  
        <button 
          type="submit" 
          :disabled="loading || (newPassword && (!currentPassword || newPassword !== confirmPassword))"
          class="save-button"
        >
          <svg v-if="loading" class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
          {{ loading ? 'Sauvegarde...' : 'Sauvegarder' }}
        </button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { db, auth } from '@/firebase'
  import { ref as dbRef, update } from 'firebase/database'
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
  import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
  
  export default {
    setup() {
      const router = useRouter()
      const authStore = useAuthStore()
      const displayName = ref(authStore.user?.displayName || '')
      const photoFile = ref(null)
      const previewPhoto = ref(authStore.user?.photoURL || '')
      const loading = ref(false)
      const currentPassword = ref('')
      const newPassword = ref('')
      const confirmPassword = ref('')
  
      // États pour l'affichage des champs de mot de passe
      const showPasswordFields = ref(false)
      const showCurrentPassword = ref(false)
      const showNewPassword = ref(false)
      const showConfirmPassword = ref(false)
  
      // Calcul de la force du mot de passe
      const passwordStrength = computed(() => {
        if (!newPassword.value) return { score: 0, text: '', class: '' }
        
        const password = newPassword.value
        let score = 0
        
        // Longueur
        if (password.length >= 8) score += 1
        if (password.length >= 12) score += 1
        
        // Complexité
        if (/[A-Z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[^A-Za-z0-9]/.test(password)) score += 1
        
        // Limiter le score à 4
        score = Math.min(score, 4)
        
        const strengthMap = {
          0: { text: 'Très faible', class: 'very-weak' },
          1: { text: 'Faible', class: 'weak' },
          2: { text: 'Moyen', class: 'medium' },
          3: { text: 'Fort', class: 'strong' },
          4: { text: 'Très fort', class: 'very-strong' }
        }
        
        return { 
          score, 
          text: strengthMap[score].text, 
          class: strengthMap[score].class 
        }
      })
  
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
          showPasswordFields.value = false
          
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
  
      onMounted(() => {
          displayName.value = authStore.user?.displayName || '';
          previewPhoto.value = authStore.user?.photoURL || '';
      });
  
      return {
        displayName,
        photoFile,
        previewPhoto,
        loading,
        currentPassword,
        newPassword,
        confirmPassword,
        showPasswordFields,
        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,
        passwordStrength,
        handleFileChange,
        saveProfile
      }
    }
  }
  </script>
  
  <style scoped>
  .edit-profile-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1.5rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #026aa7;
  }
  
  /* Nouvelle section pour la photo de profil */
  .profile-photo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }
  
  .profile-photo-wrapper {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border: 3px solid #0079bf;
    transition: all 0.3s ease;
  }
  
  .profile-photo-wrapper:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
  
  .profile-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .profile-photo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e4e6e9;
    color: #6b778c;
  }
  
  .photo-upload-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 8px 0;
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    justify-content: center;
  }
  
  .profile-photo-wrapper:hover .photo-upload-overlay {
    opacity: 1;
  }
  
  .photo-upload-label {
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 0.9rem;
  }
  
  .photo-upload-label svg {
    margin-right: 5px;
  }
  
  .photo-upload-input {
    display: none;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #172b4d;
  }
  
  input[type='text'],
  input[type='password'] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  input[type='text']:focus,
  input[type='password']:focus {
    border-color: #0079bf;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 121, 191, 0.2);
  }
  
  /* Section mot de passe */
  .password-section {
    margin-bottom: 1.5rem;
    border: 1px solid #eee;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .toggle-password-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #f4f5f7;
    color: #172b4d;
    border: none;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;
  }
  
  .toggle-password-btn:hover {
    background-color: #e4e6e9;
  }
  
  .toggle-password-btn .icon {
    margin-right: 0.5rem;
  }
  
  .password-fields {
    padding: 1rem;
    background-color: #f9f9f9;
    border-top: 1px solid #eee;
  }
  
  /* Animation pour les champs de mot de passe */
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
    max-height: 500px;
    overflow: hidden;
  }
  
  .slide-enter-from,
  .slide-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }
  
  /* Conteneur pour les champs de mot de passe avec bouton de visibilité */
  .password-input-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .password-input-container input {
    padding-right: 40px;
  }
  
  .toggle-visibility {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    color: #6b778c;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toggle-visibility:hover {
    color: #172b4d;
  }
  
  /* Indicateur de force du mot de passe */
  .password-strength {
    margin-top: 0.5rem;
    font-size: 0.8rem;
  }
  
  .strength-meter {
    height: 4px;
    background-color: #eee;
    border-radius: 2px;
    margin-bottom: 0.25rem;
  }
  
  .strength-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s;
  }
  
  .very-weak {
    background-color: #eb5757;
    color: #eb5757;
  }
  
  .weak {
    background-color: #f2994a;
    color: #f2994a;
  }
  
  .medium {
    background-color: #f2c94c;
    color: #f2c94c;
  }
  
  .strong {
    background-color: #27ae60;
    color: #27ae60;
  }
  
  .very-strong {
    background-color: #219653;
    color: #219653;
  }
  
  .strength-text {
    font-weight: 500;
  }
  
  /* Message d'erreur pour les mots de passe qui ne correspondent pas */
  .password-mismatch {
    color: #eb5757;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }
  
  /* Bouton de sauvegarde */
  .save-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #0079bf;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .save-button:hover {
    background-color: #026aa7;
  }
  
  .save-button:disabled {
    background-color: #a5c7d8;
    cursor: not-allowed;
  }
  
  /* Animation de chargement */
  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 576px) {
    .edit-profile-container {
      margin: 1rem;
      padding: 1rem;
    }
    
    .profile-photo-wrapper {
      width: 120px;
      height: 120px;
    }
  }
  </style>