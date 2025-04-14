import { defineStore } from 'pinia'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Initialiser l'état de l'authentification
  const init = () => {
    onAuthStateChanged(auth, (userData) => {
      if (userData) {
        user.value = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
        }
      } else {
        user.value = null
      }
      loading.value = false
    })
  }

  // Inscription
  const register = async (email, password) => {
    try {
      error.value = null
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      }
      return userCredential.user
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // Connexion
  const login = async (email, password) => {
    try {
      error.value = null
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      }
      return userCredential.user
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  // Déconnexion
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  return { user, loading, error, init, register, login, logout }
})
