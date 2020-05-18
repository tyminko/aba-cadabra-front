import { db } from './firebase'

/**
 * @param {string} programmeId
 * @return {Promise<void>}
 */
export async function disconnectEventsFromProgramme (programmeId) {
  const batch = db.batch()
  return childrenQuery('programme', programmeId)
    .get()
    .then(snapshot => {
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          partOfProgramme: null,
          countNumber: null,
          formerProgrammeId: programmeId
        })
      })
    })
    .then(() => {
      return batch.commit()
    })
}

/**
 * @param {string} parentId
 * @param {string} parentType
 * @param {string} visibilityStatus
 * @return {Promise<void>}
 */
export async function syncChildrenVisibility (parentId, parentType, visibilityStatus) {
  const batch = db.batch()
  return childrenQuery('programme', parentId)
    .get()
    .then(snapshot => {
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 'status': visibilityStatus })
      })
    })
    .then(() => {
      return batch.commit()
    })
}

/**
 * @param {string} parentType
 * @param {string} parentId
 * @return {firebase.firestore.Query}
 */
function childrenQuery (parentType, parentId) {
  const posts = db.collection('posts')
  const whereParent = parentType === 'programme' ? 'partOfProgramme.programmeId' : 'partOfEvent.eventId'
  return posts.where(whereParent, '==', parentId)
}
