let counter = 0
const characters = 'abcdefghijklmnopqrstuvwxyz'
const charLength = characters.length

/**
 * @param {string[]=} existingIds
 * @return {string}
 */
export default function simpleId (existingIds) {
  counter++
  const letter = characters.charAt(Math.floor(Math.random() * charLength))
  const test = letter + Math.random().toString(36).substr(2, 6) + counter
  if (existingIds && existingIds.length && existingIds.includes(test)) {
    return simpleId(existingIds)
  }
  return test
}
