import { db } from './firebase'
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
    return db.collection('tags').doc(id).get().then(snapshot => {
      return { ...snapshot.data(), id: snapshot.id }
    })
  },

  /**
   * @param {string} title
   * @return {Tag}
   */
  createTag (title) {
    title = title.toLowerCase().trim()
    return { id: base64(title), title, new: true }
  },

  /**
   * @param {string} value
   * @return {Promise<Tag[] | never>}
   */
  query (value) {
    return db.collection('tags')
      .where('searchIndices', 'array-contains', value.toLowerCase())
      .get()
      .then(snapshot => snapshot.docs.reduce((result, doc) => {
        const tag = { id: doc.id, title: (doc.data() || {}).title || '' }
        return [...result, tag]
      }, []))
  },

  /**
   * @param {Tag} tag
   * @return {Promise}
   */
  saveTag ({ id, title }) {
    return db.collection('tags').doc(id).set({ title })
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
