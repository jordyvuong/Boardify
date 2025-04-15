import { defineStore } from 'pinia'
import { auth } from '@/firebase'
import { db } from '@/firebase'
import { ref as dbRef, get } from 'firebase/database'
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
  const authReady = ref(false) // Nouvel état pour indiquer quand la vérification Auth est terminée

  // Initialiser l'état de l'authentification
  const init = () => {
    onAuthStateChanged(auth, async (userData) => {
      if (userData) {
        const profile = await fetchUserProfile(userData.uid)
        user.value = {
          uid: userData.uid,
          email: userData.email,
          displayName: profile.displayName || '',
          photoURL: profile.photoURL || '',
        }
      } else {
        user.value = null
      }
      loading.value = false
      authReady.value = true
    })
  }

  // Inscription
  const register = async (email, password) => {
    try {
      error.value = null
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Le profil sera créé dans la DB dans RegisterView.vue
      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: '',
        photoURL: '',
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
      const profile = await fetchUserProfile(userCredential.user.uid)
      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: profile.displayName || '',
        photoURL: profile.photoURL || '',
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

  const fetchUserProfile = async (uid) => {
    const snapshot = await get(dbRef(db, `users/${uid}`))
    return snapshot.exists() ? snapshot.val() : {}
  }

  return { user, loading, error, authReady, init, register, login, logout }
})
