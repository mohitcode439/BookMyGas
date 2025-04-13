import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence, enableNetwork } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGXVGXAPwWXQM9zznbK4iI8dE56CBgWDI",
  authDomain: "bookmygas-6c03f.firebaseapp.com",
  projectId: "bookmygas-6c03f",
  storageBucket: "bookmygas-6c03f.firebasestorage.app",
  messagingSenderId: "514443654490",
  appId: "1:514443654490:web:8e95685a4b0e32c207af63",
}

let app: any = null
let auth: any = null
let db: any = null
let storage: any = null
let isInitialized = false

export const initializeFirebase = async () => {
  if (isInitialized) return { app, auth, db, storage }

  try {
    // Only initialize on the client side
    if (typeof window === 'undefined') {
      throw new Error('Firebase can only be initialized on the client side')
    }

    // Initialize Firebase app
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    // Enable persistence
    await enableIndexedDbPersistence(db)
    console.log('Firebase persistence enabled')

    // Initialize storage
    storage = getStorage(app)

    // Enable network
    await enableNetwork(db)

    isInitialized = true
    console.log('Firebase services initialized successfully')

    return { app, auth, db, storage }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    throw error
  }
}

export const getFirebase = () => {
  if (!isInitialized) {
    throw new Error('Firebase has not been initialized. Call initializeFirebase() first.')
  }
  return { app, auth, db, storage }
} 