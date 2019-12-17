import Firebase from 'firebase/app'
import { storage } from './firebase'
import ImageLib from './image'

/**
 * @typedef {{w:number, h:number}} Dimensions
 *
 * @typedef {{
 *  raw?: HTMLCanvasElement
 *  blob?: Blob
 *  dimensions: Dimensions
 *  url: string
 * }} ImageData
 *
 * @typedef {Object<string, ImageData>} ImageSizeTypes
 *
 * @typedef {ImageSizeTypes & {
 *  order: number
 *  caption: string
 * }} PostImageData
 *
 *
 * @typedef {PostImageData & {
 *  id?: string
 *  delited?: boolean
 * }} ImageAttachment
 *
 *
 * @typedef {ImageAttachment & {
 *  file: File
 *  image: HTMLImageElement
 * }} NewImageAttachment
 *
 *
 * @typedef {{
 *  sizeType: string
 *  blob: Blob
 *  name: string
 *  dimensions: Dimensions
 *  attachment: NewImageAttachment
 *  }} UploadFileStruct
 *
 * @typedef {{
 *  uploadData: UploadFileStruct
 *  url: string
 * }} UploadedFileData
 */

const imageSizeTypes = { full: 2048, preview: 512 }

const mimeExtension = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

const stringIsExtension = string => {
  return string === 'gif' || string === 'jpg' || string === 'png'
}

/**
 * @return {string}
 */
export function uniqueId () {
  return Date.now().toString().substr(-7) + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9)
}

/**
 * @param {Blob} blob
 * @param {string} name
 * @param {string} sizeType
 * @param {Dimensions} dimensions
 * @param {NewImageAttachment} attachment
 * @return {UploadFileStruct}
 */
export function uploadFileStruct (blob, name, sizeType, dimensions, attachment) {
  return { blob, name, sizeType, dimensions, attachment }
}

/**
 * @param {string} path
 * @param {UploadFileStruct} uploadData
 * @param {function(string, number): void} progressFn
 * @return {Promise<UploadedFileData>}
 */
function put (path, uploadData, progressFn) {
  const uploadTask = storage.ref(path).put(uploadData.blob, { contentType: uploadData.blob.type })
  return new Promise((resolve, reject) => {
    uploadTask.on(Firebase.storage.TaskEvent.STATE_CHANGED,
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        // console.log('Upload is ' + progress + '% done')
        if (progressFn) {
          progressFn(uploadData.attachment.id, progress)
        }
        switch (snapshot.state) {
          case Firebase.storage.TaskState.PAUSED:
            // console.log('Upload is paused')
            break
          case Firebase.storage.TaskState.RUNNING:
            // console.log('Upload is running')
            break
        }
      },
      error => reject(error),
      () => resolve(uploadTask.snapshot))
  }).then(snapshot => {
    // console.log('New pic uploaded. Size:', snapshot.totalBytes, 'bytes.')
    return snapshot.ref.getDownloadURL().then(url => {
      // console.log('File available at', url)
      return { uploadData, url }
    })
  })
}

/**
 * @param {string} userId
 * @param {Object<string, PostImageData>} attachments
 * @param {function(string, number): void} progressFn
 * @return {Promise<Object<string, PostImageData> | never>}
 */
export function upload (userId, attachments, progressFn) {
  const newAttachments = filterNewAttachments(attachments)
  return Promise.all(newAttachments.map(newAttachment => {
    return newAttachmentToUploadFileStructs(newAttachment)
      .then(filesForUpload => {
        return Promise.all(filesForUpload.map(fileData => {
          const path = filePath(userId, fileData.name, fileData.sizeType, fileData.blob.type)
          return put(path, fileData, progressFn)
        }))
      })
  }))
    .then(uploadedAttachments => {
      return uploadedAttachments.reduce((res, uploadedSizeTypes) => {
        uploadedSizeTypes.forEach(sizeData => {
          const { name, sizeType, dimensions } = sizeData.uploadData
          if (!res.hasOwnProperty(name)) {
            const { caption = '', order = 0 } = sizeData.uploadData.attachment
            res[name] = { caption, order }
          }
          res[name][sizeType] = { dimensions, url: sizeData.url }
        })
        return res
      }, {})
    })
}

/**
 * @param {string} userId
 * @param {string} imageId
 * @param {string} size
 * @param {string} mimeType
 * @return {string}
 */
function filePath (userId, imageId, size, mimeType) {
  const extension = stringIsExtension(mimeType) ? mimeType : mimeExtension[mimeType] || ''
  return `${userId}/images/${imageId}-${size}` + (extension ? `.${extension}` : '')
}

/**
 * @param {Object<string, PostImageData>} attachmentsToDelete
 * @return {Promise<any | never>}
 */
export function deleteAttachments (userId, attachmentsToDelete) {
  const promises = []
  Object.entries(attachmentsToDelete).forEach(([id, attachment]) => {
    Object.keys(imageSizeTypes).forEach(sizeType => {
      if (attachment.hasOwnProperty(sizeType)) {
        const extension = attachment[sizeType].url.split('.').pop()
        const path = filePath(userId, id, sizeType, extension)
        promises.push(storage.ref(path).delete().catch(e => {
          throw new Error(`${e.message}\nFor path: ${path}`)
        }))
      }
    })
  })
  return Promise.all(promises)
}
/**
 * @param {string} userId
 * @param {string} fileId
 * @param {string} extension
 * @return {Promise<any | never>}
 */
export function remove (userId, fileId, extension) {
  return Promise.all(Object.keys(imageSizeTypes).map(sizeType => {
    return storage.ref(filePath(userId, fileId, sizeType, extension)).delete()
  }))
}

/**
 * @param {Object<string, PostImageData>} attachments
 * @return {NewImageAttachment[]}
 */
function filterNewAttachments (attachments) {
  return Object.entries(attachments).reduce((res, [id, attachment]) => {
    if (attachment.hasOwnProperty('file')) {
      res.push({ ...attachment, id })
    }
    return res
  }, [])
}

/**
 * @param {NewImageAttachment} newAttachment
 * @return {Promise<UploadFileStruct[]>}
 */
function newAttachmentToUploadFileStructs (newAttachment) {
  const mimeType = newAttachment.file.type
  const storageName = uniqueId()
  /* DEBUG */
  console.log('%c %c newAttachmentToUploadFileStructs storageName: ', 'background:#ffbb00;color:#000', 'color:#00aaff', storageName)
  return Promise.all(Object.keys(imageSizeTypes).map(sizeType => {
    return sizeTypeToUploadFileStruct(newAttachment, sizeType, mimeType, storageName)
  }))
}

/**
 * @param {NewImageAttachment} attachment
 * @param {string} sizeType
 * @param {string} mimeType
 * @param {string} storageName
 * @return {Promise<UploadFileStruct>}
 */
function sizeTypeToUploadFileStruct (attachment, sizeType, mimeType, storageName) {
  if (notResized(attachment, sizeType)) {
    return resizeForUpload(attachment, sizeType, mimeType, storageName)
  } else if (noResizedFileFor(attachment, sizeType)) {
    const raw = attachment[sizeType].raw
    return ImageLib.canvasToBlob(raw, mimeType)
      .then(blob => uploadFileStruct(blob, storageName, sizeType, ImageLib.picDimensions(raw), attachment))
  } else {
    const blob = attachment[sizeType].blob
    const dimensions = attachment[sizeType].dimensions
    return Promise.resolve(uploadFileStruct(blob, storageName, sizeType, dimensions, attachment))
  }
}

/**
 * @param {NewImageAttachment} attachment
 * @param {string} sizeType
 * @param {string} mime
 * @param {string} storageName
 * @return {Promise<UploadFileStruct>}
 */
function resizeForUpload (attachment, sizeType, mime, storageName) {
  let dimensions
  let action
  if (!attachment.image) {
    action = ImageLib.imageFromFile(attachment.file)
      .then(image => {
        attachment.image = image
      })
  } else {
    action = Promise.resolve()
  }
  return action.then(() => ImageLib.resize(attachment.image, imageSizeTypes[sizeType])
    .then(resizedData => {
      dimensions = resizedData.dimensions
      return ImageLib.canvasToBlob(resizedData.raw, mime)
    })
    .then(blob => uploadFileStruct(blob, storageName, sizeType, dimensions, attachment))
    .catch(e => {
      const errString = `Error on Resize Image (${attachment.id}): ${e.message}`
      console.warn(errString)
      throw new Error(errString)
    })
  )
}

/**
 * @param {NewImageAttachment} attachment
 * @param {string} sizeType
 * @return {boolean}
 */
function notResized (attachment, sizeType) {
  return !attachment.sizeType || !attachment[sizeType].hasOwnProperty('raw')
}

/**
 * @param {NewImageAttachment} attachment
 * @param {string} sizeType
 */
function noResizedFileFor (attachment, sizeType) {
  return !attachment[sizeType].hasOwnProperty('blob')
}
