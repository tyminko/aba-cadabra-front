/**
 * maxim tyminko 2019-08-24.
 * maximtyminko.com
 */
import { db, FieldValue } from './firebase'
import * as Storage from './storage'
import removeProp from './remove-prop'

/**
 * @typedef {{
 *   role: string
 *   name: string
 *   url: string
 * }} Collaborator
 *
 * @typedef {{
 *  title: string
 *  type: string // Kind of a category
 *  text: string
 *  technicalDescription: string
 *  posterImage: Storage.PostImageData
 *  attachments: Object<string, Storage.PostImageData>
 *  workCreatedAt: firebase.firestore.Timestamp
 *  credits: Collaborator[]
 *  order?: number
 *  author: string
 *  createdAt: firebase.firestore.Timestamp
 *  published: boolean
 * }} WorkData
 */

export default {
  /**
   * @param {string} userId
   * @param {WorkData} workData
   * @param {Object<string, Storage.ImageAttachment>} attachments
   * @param {function(string, number): void} progressFn
   * @return {Promise<void | never>}
   */
  create (userId, workData, attachments, progressFn) {
    return Promise.resolve()
      .then(() => db.collection('works').add({
        ...workData,
        author: userId,
        createdAt: FieldValue.serverTimestamp()
      }))
      .then(doc => Storage.upload(userId, attachments, progressFn)
        .then(uploadedAttachments => {
          return doc.update({ attachments: uploadedAttachments })
        }))
  },

  /**
   * @param {string} userId
   * @param {string} workId
   * @param {WorkData} workData
   * @param {Object<string, Storage.PostImageData>} attachments
   * @param {Object<string, Storage.PostImageData>} attachmentsToDelete
   * @param {function(string, number): void} progressFn
   * @return {Promise<void | never>}
   */
  update (userId, workId, workData, attachments, attachmentsToDelete, progressFn) {
    return Promise.resolve()
      .then(() => Storage.upload(userId, attachments, progressFn))
      .then(uploadedAttachments => {
        const oldAttachments = this.filterOldAttachments(attachments)
        return db.collection('works').doc(workId).update({
          ...removeProp(workData, 'id'),
          attachments: { ...oldAttachments, ...uploadedAttachments }
        })
      })
  },

  /**
   * @param {Object<string, Storage.PostImageData>} attachments
   * @return {Object<string, Storage.PostImageData>}
   */
  filterOldAttachments (attachments) {
    return Object.entries(attachments).reduce((res, [key, attachment]) => {
      if (!attachment.hasOwnProperty('file') && !attachment.hasOwnProperty('deleted')) {
        res[key] = attachment
      }
      return res
    }, {})
  }
}
