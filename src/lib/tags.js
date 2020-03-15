import { store } from './firebase'
import base64 from './base64'

/**
 * @typedef {{
 *  id: string,
 *  title: string
 * }} Tag
 */

export default {

  /**
   * @param {string} id
   * @return {Promise<Tag | never>}
   */
  get (id) {
    return store.ref(`tag/${id}`).once('value').then(snapshot => {
      return { ...snapshot.val(), id: snapshot.key }
    })
  },

  /**
   * @param {string} title
   * @param {string} type
   * @return {Tag}
   */
  createTag (title, type) {
    title = title.toLowerCase().trim()
    return { id: base64(title), title, types: [type] }
  },

  /**
   * @param {string} value
   * @param {string?} type
   * @return {Promise<Tag[] | never>}
   */
  query (value, type) {
    value = value.toLowerCase()
    const ref = store.ref('tag').startAt(value).endAt(`${value}\uf8ff`).orderByChild('title')
    return ref.once('value').then(snapshot => {
      const data = []
      snapshot.forEach(childSnapshot => {
        data.push({
          ...childSnapshot.val(),
          id: childSnapshot.key,
          type: 'tag'
        })
      })
      if (type) {
        return data.filter(item => Array.isArray(item.types) && item.types.includes(type))
      }
      return data
    })
  },

  /**
   * @param {Tag} tag
   * @return {Promise<Tag | never>}
   */
  saveTag ({ id, title, types }) {
    return store.ref(`tag/${id}`).transaction(data => ({
      id,
      title,
      types: Object.keys([...((data || {}).types || []), ...(types || [])]
        .reduce((result, type) => ({ ...result, [type]: true }), {}))
    })).then(({ snapshot }) => snapshot.val())
  },

  /**
   * @param {Tag[]} tags
   * @param {Tag} tag
   * @return {Tag[]}
   */
  removeTag (tags, tag) {
    const data = JSON.parse(JSON.stringify(tags || []))
    data.splice(data.findIndex(t => (tag.id && t.id === tag.id) || t.title === tag.title), 1)
    return data
  }
}
