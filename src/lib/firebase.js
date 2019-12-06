import firebase from 'firebase'

export const config = {
  apiKey: 'AIzaSyBK82_DBknR1YdvhHUE_8Cfoez_sG-FgQU',
  authDomain: 'aba-cadabra-test.firebaseapp.com',
  databaseURL: 'https://aba-cadabra-test.firebaseio.com',
  projectId: 'aba-cadabra-test',
  storageBucket: 'aba-cadabra-test.appspot.com',
  messagingSenderId: '101473110806',
  appId: '1:101473110806:web:21161d88a16312d7481e37'
}

export const app = firebase.initializeApp(config)
export const db = firebase.firestore()
export const auth = firebase.auth()
export const storage = firebase.storage()
export const FieldValue = firebase.firestore.FieldValue

let unsubscribe = null
export const syncAuth = store => {
  app.auth().onAuthStateChanged(user => {
    console.log('onAuthStateChanged:', user)
    if (unsubscribe) {
      unsubscribe()
    }
    if (user) {
      unsubscribe = db.collection('users').doc(user.uid).onSnapshot(
        snapshot => {
          console.log('onUserChanged:', snapshot)
          if (!snapshot.exists) {
            store.dispatch('clearUser')
          }
          store.dispatch('updateUser', {
            id: snapshot.id,
            ...snapshot.data({
              serverTimestamps: 'estimate'
            })
          })
        },
        err => {
          console.error('onUserChanged:', err)
          store.dispatch('clearUser')
        }
      )
    } else {
      store.dispatch('clearUser')
    }
  })
}
