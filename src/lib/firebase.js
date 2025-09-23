import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore, FieldValue, FieldPath } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

export const config = {
  apiKey: 'AIzaSyCxfEiKF30A51yBQ7ofv-CK9VxG-RW59Yo',
  authDomain: 'aba-cadabra.firebaseapp.com',
  databaseURL: 'https://aba-cadabra.firebaseio.com',
  projectId: 'aba-cadabra',
  storageBucket: 'aba-cadabra.appspot.com',
  messagingSenderId: '110254923980',
  appId: '1:110254923980:web:7e061f51d355a57c656269',
  measurementId: 'G-CCFSJH8HQJ'
}

export const app = initializeApp(config)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
export { FieldValue, FieldPath }

export const syncAuth = store => {
  auth.onAuthStateChanged(user => {
    if (user) {
      auth.currentUser.getIdTokenResult(true)
        .then(token => {
          return token.claims.role
        })
        .then(role => {
          const { uid, displayName, email, emailVerified, phoneNumber, photoURL } = user
          store.dispatch('updateUser', {
            uid,
            displayName: displayName || email,
            email,
            emailVerified,
            phoneNumber,
            photoURL,
            role
          })
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          store.dispatch('clearUser')
        })
    } else {
      store.dispatch('clearUser')
    }
  })
}
