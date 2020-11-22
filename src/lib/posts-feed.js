import { db } from './firebase'

/**
 * @typedef {{
 *  status: string,
 *  authorId?: string,
 *  type?: string,
 *  collectionName?:string,
 *  orderBy?: {field:string, direction:'desc' | 'asc'}
*  }} QueryOptions
 */
/**
 * @param {QueryOptions|null} options
 * @param {function} onPostUpdate
 * @param {function} onPostRemove
 * @param {function=} onComplete
 * @param {function=} onError
 *
 * @return {function} // unsubscribe function
 */
export function subscribeToPosts (options, onPostUpdate, onPostRemove, onComplete, onError) {
  const status = (options || {}).status || 'public'
  let query = db.collection((options || {}).collectionName || 'posts')
    .where('status', '==', status)

  if ((options || {}).authorId) {
    query = query.where('author.uid', '==', options.authorId)
  }
  if ((options || {}).type) {
    query = query.where('type', '==', options.type)
  }
  if ((options || {}).orderBy) {
    if (options.orderBy.field) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'desc')
    }
  } else {
    query = query.orderBy('date', 'desc')
  }
  return query.onSnapshot({
    next: querySnapshot => {
      querySnapshot.docChanges().forEach(docChange => {
        const doc = docChange.doc
        switch (docChange.type) {
          case 'added':
          case 'modified':
            onPostUpdate(doc.id, { ...doc.data(), id: doc.id })
            break
          case 'removed':
            onPostRemove(doc.id)
        }
      })
      if (typeof onComplete === 'function') onComplete()
    },
    error: err => {
      if (typeof onError === 'function') {
        onError(err)
      } else {
        const author = (options || {}).authorId
        const authStr = author ? ` by author '${author}'` : ''
        console.error(`Subscribe To Posts (status '${status}'${authStr}):`, err)
      }
      if (typeof onComplete === 'function') onComplete()
    }
  })
}
