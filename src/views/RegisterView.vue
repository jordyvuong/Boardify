<template>
  <div class="register-container">
    <div class="register-form">
      <h1>Créer un compte</h1>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="displayName">Nom d'utilisateur</label>
          <input
            type="text"
            id="displayName"
            v-model="displayName"
            required
            placeholder="Votre nom d'utilisateur"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="Votre email" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Votre mot de passe"
            minlength="6"
          />
          <small class="password-hint">Le mot de passe doit contenir au moins 6 caractères</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Confirmez votre mot de passe"
          />
        </div>

        <button type="submit" :disabled="loading || !isFormValid">
          {{ loading ? 'Inscription en cours...' : "S'inscrire" }}
        </button>
      </form>

      <div class="register-footer">
        <p>Vous avez déjà un compte ? <router-link to="/login">Se connecter</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getDatabase, ref as dbRef, set } from 'firebase/database'
import { auth } from '@/firebase'

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const authStore = useAuthStore()
const db = getDatabase()

// Vérifier si le formulaire est valide
const isFormValid = computed(() => {
  return (
    displayName.value.trim() !== '' &&
    email.value.trim() !== '' &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value
  )
})

const handleRegister = async () => {
  // Réinitialiser l'erreur
  error.value = ''

  // Vérifier que les mots de passe correspondent
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    loading.value = true

    // Créer le compte utilisateur
    const userCredential = await authStore.register(email.value, password.value)

    // Sauvegarder les informations supplémentaires dans la base de données
    await set(dbRef(db, `users/${userCredential.uid}`), {
      displayName: displayName.value,
      email: email.value,
      createdAt: Date.now(),
    })

    // Rediriger vers les tableaux
    router.push('/boards')
  } catch (e) {
    console.error('Register error:', e)

    // Traduire les messages d'erreur courants de Firebase
    if (e.code === 'auth/email-already-in-use') {
      error.value = 'Cette adresse email est déjà utilisée'
    } else if (e.code === 'auth/invalid-email') {
      error.value = 'Adresse email invalide'
    } else if (e.code === 'auth/weak-password') {
      error.value = 'Le mot de passe est trop faible'
    } else {
      error.value = "Une erreur est survenue lors de l'inscription"
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafc;
  padding: 1rem;
}

.register-form {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #0079bf;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #0079bf;
  outline: none;
}

.password-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #6b778c;
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
  margin-top: 0.5rem;
}

button:hover {
  background-color: #026aa7;
}

button:disabled {
  background-color: #a5c7d8;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

@media (max-width: 500px) {
  .register-form {
    padding: 1.5rem;
  }
}
</style>
