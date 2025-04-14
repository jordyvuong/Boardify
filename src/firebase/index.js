// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDeOSYF0DetIM7S0wxbkDAIxRLTxSeQ6kU',
  authDomain: 'boardify-ffc27.firebaseapp.com',
  projectId: 'boardify-ffc27',
  storageBucket: 'boardify-ffc27.firebasestorage.app',
  messagingSenderId: '565573258823',
  appId: '1:565573258823:web:7190b63a3e4b9367622b62',
  measurementId: 'G-84WLSKGRLB',
  databaseURL: 'https://boardify-ffc27-default-rtdb.firebaseio.com', // Ajoutez cette ligne
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
const analytics = getAnalytics(firebaseApp)
const db = getDatabase(firebaseApp)
const auth = getAuth(firebaseApp)

export { firebaseApp, db, auth, analytics }
