import firebase from 'firebase'

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
export const FieldValue = firebase.firestore.FieldValue

export const syncAuth = store => {
  app.auth().onAuthStateChanged(user => {
    console.log('onAuthStateChanged:', user)
    if (user) {
      auth.currentUser.getIdTokenResult(true)
        .then(token => {
          return token.claims.role
        })
        .then(role => {
          store.dispatch('updateUser', {
            id: user.uid,
            displayName: user.displayName || user.email,
            photoURL: user.photoURL,
            role
          })
        })
        .catch((error) => {
          console.log(error)
          store.dispatch('clearUser')
        })
    } else {
      store.dispatch('clearUser')
    }
  })
}
