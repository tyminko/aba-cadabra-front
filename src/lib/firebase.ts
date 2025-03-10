import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage } from '@firebase/storage'
import { getFunctions } from '@firebase/functions'
import store from '../store'

const firebaseConfig = {
  apiKey: 'mock-api-key',
  authDomain: 'mock-domain',
  projectId: 'mock-project',
  storageBucket: 'mock-bucket',
  messagingSenderId: 'mock-sender',
  appId: 'mock-app-id'
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// Mock a logged-in admin user
const mockUser = {
  uid: 'mock-user-id',
  email: 'admin@example.com',
  displayName: 'Admin User',
  emailVerified: true,
  phoneNumber: null,
  photoURL: null,
  role: 'admin'
}

export const syncAuth = (store: any) => {
  // Dispatch mock user immediately
  store.dispatch('setUser', mockUser)

  // Mock auth state change listener
  onAuthStateChanged(auth, () => {
    store.dispatch('setUser', mockUser)
  })
}

export default app
