import { db, FieldValue } from './firebase'

/**
 * @param {string} id
 * @param {string} type
 * @param {string} newStatus
 * @param {string} title
 * @param {boolean=} isNewTitle
 * @return {Promise<void>}
 */
export async function manageUpdatePublicMenuItem (id, type, newStatus, title, isNewTitle) {
  if (!id) return
  if (newStatus) {
    if (newStatus === 'public') {
      return addPublicMenuItem(id, type, title)
    } else {
      return removePublicMenuItem(id)
    }
  } else if (isNewTitle) {
    return updatePublicMenuItem(id, title)
  }
}

export async function addPublicMenuItem (id, type, title) {
  return db.collection('settings')
    .doc('publicMenu')
    .update({ [`items.${id}`]: { id, type, title } })
}

export async function updatePublicMenuItem (id, title) {
  return db.collection('settings')
    .doc('publicMenu')
    .update({ [`items.${id}.title`]: title })
}

export async function removePublicMenuItem (id) {
  return db.collection('settings')
    .doc('publicMenu')
    .update({ [`items.${id}`]: FieldValue.delete() })
}
