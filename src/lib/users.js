// Use compat to preserve namespaced API with v9
import firebase from 'firebase/compat/app'
import 'firebase/compat/functions'

export async function getAll () {
  const allUsersFunc = firebase.functions().httpsCallable('users-all')
  const res = await allUsersFunc()
  if (res.data.error) {
    console.error(res.data.error)
  } else {
    return res.data
  }
  return null
}

/**
 * @param {{
 *  displayName: string
 *  email: string
 *  password: string
 *  phoneNumber?: string
 *  photoURL?: string
 *  emailVerified?: boolean
 *  disabled?: boolean
 *  role: string
 * }} userData
 */
export async function addUser (userData) {
  try {
    const addUserFunc = firebase.functions().httpsCallable('users-add')
    const res = await addUserFunc(userData)
    if (res.data.error) {
      console.error('ERROR Creating New User: ', res.data.error)
    } else {
      return res.data
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

export async function updateUser (userData) {
  try {
    const updateUserFunc = firebase.functions().httpsCallable('users-update')
    const res = await updateUserFunc(userData)
    return res.data
  } catch (error) {
    console.error('Update User:', error)
    return Promise.reject(error)
  }
}

export async function remove (id) {
  try {
    const removeUserFunc = firebase.functions().httpsCallable('users-remove')
    const res = await removeUserFunc(id)
    if (res.data.error) {
      console.error(res.data.error)
    } else {
      return true
    }
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
  return false
}

export function generatePassword () {
  const randCharFromStr = str => str.charAt(Math.floor(Math.random() * str.length))
  const length = 12
  const lows = 'abcdefghijklmnopqrstuvwxyz'
  const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const specials = '.?!:;()[]{}~-_`@#$%^&*+='
  const charset = lows + specials + caps + numbers
  let checkLow, checkCap, checkNum, checkSpecial
  let retVal = ''
  for (let i = 0; i < length; ++i) {
    const char = randCharFromStr(charset)
    if (lows.includes(char)) checkLow = true
    if (caps.includes(char)) checkCap = true
    if (numbers.includes(char)) checkNum = true
    if (specials.includes(char)) checkSpecial = true
    retVal += char
  }
  if (!checkLow) retVal += randCharFromStr(lows)
  if (!checkCap) retVal += randCharFromStr(caps)
  if (!checkNum) retVal += randCharFromStr(numbers)
  if (!checkSpecial) retVal += randCharFromStr(specials)
  return retVal
}
