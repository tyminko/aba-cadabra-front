// Use Firebase v9 compat to keep namespaced API working
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/storage'
import 'firebase/compat/firestore'
import 'firebase/compat/functions'

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

export const app = firebase.initializeApp(config)
export const db = firebase.firestore()
export const auth = firebase.auth()
export const storage = firebase.storage()
export const functions = firebase.functions()
export const FieldValue = firebase.firestore.FieldValue
export const FieldPath = firebase.firestore.FieldPath

export const syncAuth = store => {
  app.auth().onAuthStateChanged(user => {
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
