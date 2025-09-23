import { storage } from './firebase'
// TaskEvent and TaskState are available on the storage instance in Firebase v9
import { toSlug } from './string'
import simpleId from './simpleId'
import ImageLib from './image'
// import { FileData, ImageData, KnownAttachmentSizes } from './storage'

export const imageSizeTypes = {
  full: 2048,
  preview: 800
}

const alwaysUploadOriginalImage = false

const mimeExtension = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'video/mp4': 'mp4'
}

const possibleExtensions = ['gif', 'jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'mp3', 'm4a', 'mp4', 'mov']

/**
 * @param {File} file
 * @return {boolean}
 */
export function isSupportedImage (file) {
  return file.type.startsWith('image') && isSupportedFormat(file)
}

/**
 * @param {File} file
 * @return {boolean}
 */
export function isSupportedFormat (file) {
  return mimeExtension.hasOwnProperty(file.type)
}

export function fileToRawAttachment (file) {
  return {
    id: simpleId(),
    file,
    type: file.type,
    image: null,
    srcSet: null,
    order: null,
    caption: null,
    pointOfInterest: null,
    progress: 0,
    err: null
  }
}

/**
 * @param {string} userId
 * @param {RawAttachment[]} attachments
 * @param {function(string, number): void} progressFn
 * @return {Promise<PostAttachment[] | never>}
 */
export function upload (userId, attachments, progressFn) {
  return Promise.all(attachments.map(attachment => {
    const baseName = attachment.storageName || (attachment.file ? `${attachment.id}-${toSlug(attachment.file.name)}` : '')
    return thingsToUploadForAttachment(attachment)
      .then(thingsToUpload => {
        const attachmentProgress = {
          max: thingsToUpload.length * 100,
          total: 0,
          parts: {}
        }
        return Promise.all(thingsToUpload.map(/** @type DataToUpload */ dataToUpload => {
          const sizeType = dataToUpload.sizeType
          const path = filePath(userId, baseName, sizeType, dataToUpload.blob.type)
          return put(path, dataToUpload, (id, progress) => {
            attachmentProgress.parts[sizeType] = progress
            const sum = Object.values(attachmentProgress.parts).reduce((r, p) => r + p)
            progressFn(id, sum / attachmentProgress.max * 100)
          })
        }))
      })
  }))
    .then(/** @type UploadedData[][] */ uploadedAttachments => {
      const attachments = uploadedAttachments.reduce((attachments, uploadedDataBySize) => {
        uploadedDataBySize.forEach(uploadedData => {
          const id = uploadedData.rawAttachment.id
          if (!attachments.hasOwnProperty(id)) {
            const { type, name, order, caption, pointOfInterest } = uploadedData.rawAttachment
            attachments[id] = { id, type, order, caption, pointOfInterest, srcSet: {} }
            if (name) attachments[id].name = name
          }
          const { url, sizeType, dimensions, blob } = uploadedData
          attachments[id].srcSet[sizeType] = { url, size: blob.size }
          if (dimensions) attachments[id].srcSet[sizeType].dimensions = dimensions
        })
        return attachments
      }, {})
      return Object.values(attachments).sort((a, b) => a.order - b.order)
    })
}

/**
 * @param {string} path
 * @param {DataToUpload} dataToUpload
 * @param {function(string, number): void} progressFn
 * @return {Promise<UploadedData|never>}
 */
function put (path, dataToUpload, progressFn) {
  const uploadTask = storage.ref(path).put(dataToUpload.blob, { contentType: dataToUpload.blob.type })
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        // console.log('Upload is ' + progress + '% done')
        if (progressFn) {
          progressFn(dataToUpload.rawAttachment.id, progress)
        }
        switch (snapshot.state) {
          case 'paused':
            // console.log('Upload is paused')
            break
          case 'running':
            // console.log('Upload is running')
            break
        }
      },
      error => reject(error),
      () => resolve(uploadTask.snapshot))
  })
    .then(snapshot => {
      return snapshot.ref.getDownloadURL()
    })
    .then(url => {
      return { ...dataToUpload, url }
    })
}

/**
 * @param {string} userId
 * @param {string} baseName
 * @param {string} sizeStr
 * @param {string} mimeType
 * @return {string}
 */
function filePath (userId, baseName, sizeStr, mimeType) {
  const parts = baseName.split('.')
  const suffix = parts.pop()
  if (parts.length && possibleExtensions.includes(suffix)) {
    baseName = parts.join('.')
  }
  let extension = possibleExtensions.includes(mimeType) ? mimeType : mimeExtension[mimeType] || ''
  extension = extension ? `.${extension}` : ''
  const sizeSuffix = sizeStr && sizeStr !== 'original' ? `-${sizeStr}` : ''
  return userId + '/' + baseName + sizeSuffix + extension
}

/**
 * @param {RawAttachment} attachment
 * @return {Promise<DataToUpload[]>|[]}
 */
async function thingsToUploadForAttachment (attachment) {
  if (!attachment.file) return []
  if (!attachment.image && attachment.type.startsWith('image/')) {
    attachment.image = await ImageLib.imageFromFile(attachment.file)
  }
  const mimeType = attachment.file.type

  if (mimeType.startsWith('image/') && mimeType !== 'image/gif') { // not supporting gif resizing yet
    const sizeKeys = Object.keys(imageSizeTypes)
    const resizeKeys = sizeKeys.filter(sizeStr => {
      const s = imageSizeTypes[sizeStr]
      return attachment.image.naturalWidth >= s || attachment.image.naturalHeight >= s
    })
    if (resizeKeys.length !== sizeKeys.length || alwaysUploadOriginalImage) {
      resizeKeys.push('original')
    }
    return Promise.all(resizeKeys.map(sizeKey => {
      return dataToUploadForImgSize(sizeKey, attachment, mimeType)
    }))
  } else {
    const origData = { sizeType: 'original', blob: attachment.file }
    if (mimeType === 'image/gif') {
      origData.dimensions = { w: attachment.image.naturalWidth, h: attachment.image.naturalHeight }
    }
    origData.rawAttachment = attachment
    if (mimeType === 'application/pdf') {
      const sizes = await Promise.all(Object.keys(imageSizeTypes).map(sizeKey => {
        return dataToUploadForImgSize(sizeKey, attachment, 'image/jpeg')
      }))
      return Promise.resolve([...sizes, origData])
    } else {
      return Promise.resolve([origData])
    }
  }
}

/**
 * @param {RawAttachment} rawAttachment
 * @param {string} sizeType
 * @param {string} mimeType
 * @return {Promise<DataToUpload|null>}
 */
async function dataToUploadForImgSize (sizeType, rawAttachment, mimeType) {
  if (rawAttachment.srcSet &&
      rawAttachment.srcSet.hasOwnProperty(sizeType) &&
      rawAttachment.srcSet[sizeType].blob &&
      rawAttachment.srcSet[sizeType].dimensions) {
    return {
      sizeType,
      blob: rawAttachment.srcSet[sizeType].blob,
      dimensions: rawAttachment.srcSet[sizeType].dimensions,
      rawAttachment
    }
  } else {
    const { blob, dimensions } = await resizeForUpload(rawAttachment, sizeType, mimeType)
    return {
      sizeType,
      blob,
      dimensions,
      rawAttachment
    }
  }
}

/**
 * @param {RawAttachment} attachment
 * @param {string} sizeType
 * @param {string} mime
 * @return {Promise<{blob: Blob, dimensions: Dimensions}>|never}
 */
async function resizeForUpload (attachment, sizeType, mime) {
  /** @type Dimensions */
  let dimensions
  let image = attachment.image
  if (sizeType === 'original') {
    return { blob: attachment.file, dimensions: { w: image.naturalWidth, h: image.naturalHeight } }
  }
  return ImageLib.resize(image, imageSizeTypes[sizeType])
    .then(resizedData => {
      dimensions = resizedData.dimensions
      return ImageLib.canvasToBlob(resizedData.raw, mime)
    })
    .then(blob => {
      return { blob, dimensions }
    })
    .catch(e => {
      const errString = `Error on Resize Image (${attachment.id}) for size type (${sizeType}): ${e.message}`
      console.warn(errString)
      throw new Error(errString)
    })
}

/**
 * @param {string} userId
 * @param {PostAttachment[]} attachmentsToDelete
 * @return {Promise<* | never>}
 */
export function deleteAttachments (userId, attachmentsToDelete) {
  return Promise.all(attachmentsToDelete.map(attachment => {
    if (attachment.hasOwnProperty('srcSet')) {
      return Promise.all(Object.entries(attachment.srcSet).map(([sizeType, sizeData]) => {
        let path
        if (attachment.name) {
          path = filePath(userId, attachment.name, sizeType, attachment.type)
        } else {
          const match = sizeData.url.match(/\/([^/]+)%2F([^?]+)/)
          if (match) {
            path = match[1] + '/' + match[2]
          }
        }
        return storage.ref(path).delete()
          .catch(e => {
            if (e.code === 'storage/object-not-found') {
              return null
            }
            throw new Error({ ...e, message: `${e.message} | Path: [${path}]` })
          })
      }))
    }
  }))
}
/**
 * @param {string} userId
 * @param {string} fileId
 * @param {string} extension
 * @return {Promise<any | never>}
 */
export function remove (userId, fileId, extension) {
  return Promise.all(Object.keys({ ...imageSizeTypes, original: '' }).map(sizeType => {
    return storage.ref(filePath(userId, fileId, sizeType, extension)).delete()
  }))
}
