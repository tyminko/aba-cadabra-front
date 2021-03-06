import axios from 'axios'
import Pica from 'pica/dist/pica'

const pica = new Pica()

export default {
  defaultResizeSettings: {
    unsharpAmount: 80,
    unsharpRadius: 0.51,
    unsharpThreshold: 1,
    alpha: true
  },

  imageQuality: 0.8,
  dontScaleUp: true,

  /**
   * @param {File} file
   * @return {Promise<string>}
   */
  fileToDataUrl (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        // @ts-ignore
        resolve(e.target.result)
      }
      reader.onerror = e => {
        reject(e)
      }
      reader.readAsDataURL(file)
    })
  },

  /**
   * @param {File|Blob} file
   * @return {Promise<HTMLImageElement>}
   */
  imageFromFile (file) {
    return new Promise((resolve, reject) => {
      if (file.type.substr(0, 6) !== 'image/') {
        reject(new Error(`File is not an image: ${file.name}`))
      } else {
        resolve(this.fileToDataUrl(file))
      }
    })
      .then(dataUrl => this.imageFromUrl(dataUrl))
  },

  /**
   * @param {string} url
   * @return {Promise<HTMLImageElement>}
   */
  imageFromUrl (url) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        resolve(image)
      }
      image.onerror = e => reject(e)
      image.src = url
    })
  },

  /**
   * @param {string} url
   */
  async blobFromUrl (url) {
    try {
      const { data } = await axios({
        url,
        method: 'GET',
        responseType: 'blob',
        timeout: 1.5 * 60000,
        maxContentLength: 100000000,
        config: {
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      })
      return data
    } catch (error) {
      return Promise.resolve({ error })
    }
  },

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} mimeType
   * @param {number=} quality
   *
   * @return {Promise<Blob>}
   */
  canvasToBlob (canvas, mimeType, quality) {
    if (typeof quality === 'undefined') quality = this.imageQuality
    return pica.toBlob(canvas, mimeType, quality)
  },

  /**
   * @param {HTMLImageElement} image
   * @param {number} size
   * @param {Object=} settings
   *
   * @return {Promise<{ raw: HTMLCanvasElement, dimensions: Dimensions }>}
   */
  resize (image, size, settings) {
    settings = { ...this.defaultResizeSettings, ...settings }
    return this.picaResize(image, size, settings)
      .then(canvas => {
        return { raw: canvas, dimensions: this.picDimensions(canvas) }
      })
  },

  /**
   * @param {HTMLImageElement} img
   * @return {{w: *, h: *}}
   */
  imageDimensions (img) {
    const { naturalWidth, naturalHeight } = img
    return { w: naturalWidth, h: naturalHeight }
  },

  /**
   * @param {HTMLImageElement} image
   * @param {number} size
   *
   * @return {Promise<HTMLCanvasElement>}
   */
  basicResize (image, size) {
    const canvas = this.createCanvas(this.imageDimensions(image), size)
    canvas
      .getContext('2d')
      .drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height)
    return Promise.resolve(canvas)
  },

  /**
   * @param {HTMLImageElement|HTMLCanvasElement} image
   * @param {number} size
   * @param {Object=} settings
   *
   * @return {Promise<HTMLCanvasElement>}
   */
  picaResize (image, size, settings) {
    if (!settings) settings = this.defaultResizeSettings
    const canvas = this.createCanvas(this.imageDimensions(image), size)
    return pica.resize(image, canvas, settings)
      .catch(e => {
        if (e.message !== 'The ImageBitmap could not be allocated.') {
          throw e
        }
      })
      .then(() => {
        return this.basicResize(image, Math.max(image.naturalWidth, image.naturalHeight))
          .then(res => pica.resize(res, canvas, settings))
          .catch(() => {
            // console.warn('%c resize ON Err %c e.message: ', 'background:#ffbb00;color:#000', 'color:#00aaff', e.message)
          })
      })
  },

  /**
   * @param {{w:number, h:number}} dimensions
   * @param {number=} size
   *
   * @return {HTMLCanvasElement}
   */
  createCanvas (dimensions, size) {
    const canvas = document.createElement('canvas')
    const { w, h } = dimensions
    if (!size) size = Math.max(w, h)

    if (w > size || h > size) {
      if (w > h) {
        canvas.width = size
        canvas.height = size * h / w
      } else {
        canvas.width = size * w / h
        canvas.height = size
      }
    } else {
      canvas.width = w
      canvas.height = h
    }
    return canvas
  },

  /**
   * @param {string} url
   * @return {Promise<{w: number, h: number}>}
   */
  async imageDimensionsFromUrl (url) {
    const image = await this.imageFromUrl(url)
    return { w: image.naturalWidth, h: image.naturalHeight }
  },

  /**
   * @param {HTMLCanvasElement} pic
   * @return {{w: number, h: number}}
   */
  picDimensions (pic) {
    return { w: pic.width, h: pic.height }
  }
}
// /**
//  * @param {File} file
//  * @param {number[]} dimensions
//  * @return {Promise<{width: number, height: number, blob: Blob}[]>}
//  */
// export default function (file, dimensions) {
//   return read(file).then(image => Promise.all(dimensions.map(d => resize(image, d))))
// }
