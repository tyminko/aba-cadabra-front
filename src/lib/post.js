// import { db, FieldValue } from './firebase'
// import * as Storage from './storage'

// /**
//  * @typedef {{
//  *  height: number
//  *  width: number
//  *  url: string
//  * }} ImageData
//  *
//  * @typedef {{
//  *  order: number
//  *  full: ImageData
//  *  preview: ImageData
//  * }} PostImageData
//  *
//  * @typedef {{
//  *  author: string
//  *  published: boolean
//  *  type: string
//  *  tags: string[]
//  *  text: string
//  *  excerpt: string
//  *  posterImage: PostImageData
//  *  createdAt: Timestamp
//  * }} PostData
//  *
//  * @typedef {PostData & {
//  *  id: string
//  * }} Post
//  */

// export default {
//   /**
//    * @param {{userId?: string, tagId?: string, type?: string}} params
//    * @return {firebase.firestore.Query}
//    */
//   query (params) {
//     let query = db.collection('posts').orderBy('createdAt', 'desc')
//     if (params.hasOwnProperty('userId') && params.userId != null) {
//       query = query.where('userId', '==', params.userId)
//     }
//     if (params.hasOwnProperty('tag') && params.tag != null) {
//       query = query.where('tags', 'array-contains', params.tag)
//     }
//     if (params && params.hasOwnProperty('type') && params.type) {
//       query = query.where('type', '==', params.type)
//     }
//     return query
//   },

//   /**
//    * @param {string} id
//    * @returns {Promise<Post | null | never>}
//    */
//   get (id) {
//     return this.doc(id).get().then(doc => {
//       if (!doc.exists) {
//         return null
//       }
//       return this.fromDoc(doc)
//     })
//   },

//   /**
//    * @param {string} id
//    * @return {firebase.firestore.DocumentReference}
//    */
//   doc (id) {
//     return db.collection('posts').doc(id)
//   },

//   /**
//    * @param {firebase.firestore.DocumentSnapshot} doc
//    * @return {Post|null}
//    */
//   fromDoc (doc) {
//     if (!doc.exists) {
//       return null
//     }
//     return {
//       id: doc.id,
//       ...doc.data({ serverTimestamps: 'estimate' })
//     }
//   },

//   /**
//    * @param {string} userId
//    * @param {string} type
//    * @param {string} text
//    * @param {File[]} files
//    * @param {function(File, number)} progressFn
//    * @return {Promise<*>}
//    */
//   create (userId, type, text, files, progressFn) {
//     return Promise.resolve()
//       .then(tags => db.collection('posts').add({
//         author: userId,
//         type,
//         text,
//         exerpt,
//         tagIds: Object.keys(tags),
//         tags,
//         createdAt: FieldValue.serverTimestamp()
//       }))
//       .then(doc => Storage.upload(SPECS, userId, doc.id, files, progressFn)
//         .then(images => doc.update({ images })))
//   },

//   /**
//    * @param {string} id
//    * @param {string} type
//    * @param {string} text
//    * @param {Tag[]} tags
//    * @return {Promise<*>}
//    */
//   update (id, type, text, tags) {
//     return Promise.resolve()
//       .then(tags => this.doc(id).update({
//         type,
//         text,
//         tagIds: Object.keys(tags),
//         tags
//       }))
//   },

//   /**
//    * @param {Post} post
//    * @returns {Promise<void>}
//    */
//   delete (post) {
//     const ref = this.doc(post.id)
//     return Promise.all(Object.keys(post.images).map(imageId => this.removeImage(post, imageId)))
//       .then(() => ref.delete())
//       .then(() => {
//         if (post.hasOwnProperty('share')) {
//           return this.doc(post.share.id).update({
//             shares: FieldValue.increment(-1)
//           })
//         } else {
//           return Promise.resolve()
//         }
//       })
//   },

//   /**
//    * @param {Post} post
//    * @param {string} imageId
//    * @returns {Promise<void>}
//    */
//   removeImage (post, imageId) {
//     return Promise.all(
//       Object.keys(SPECS).map(type => Storage.remove(post.userId, post.id, imageId, type))
//     ).then(() => {
//       const images = JSON.parse(JSON.stringify(post.images))
//       delete images[imageId]
//       return this.doc(post.id).update({ images })
//     })
//   },

//   /**
//    * @param {string} id
//    * @param {number} value
//    * @returns {Promise<void>}
//    */
//   comments (id, value) {
//     return this.doc(id).update({
//       comments: FieldValue.increment(value)
//     })
//   }
// }
