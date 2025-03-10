import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export async function getUser (uid: string) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() : null
}

export async function getUserByEmail (email: string) {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('email', '==', email))
  const querySnapshot = await getDocs(q)
  return querySnapshot.empty ? null : querySnapshot.docs[0].data()
}

export default {
  getUser,
  getUserByEmail
}
