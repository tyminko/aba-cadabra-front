import Pica from 'pica/dist/pica'

const pica = new Pica()

export default {
  defaultResizeSettings: {
    unsharpAmount: 80,
    unsharpRadius: 0.51,
    unsharpThreshold: 1,
    alpha: true
  },

  /**
   * @param {File} file
   * @return {boolean}
   */
  isJpgPngGif (file) {
    return /image\/(jpeg|png|gif)/i.test(file.type)
  },

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
   * @param {File} file
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
   *
   * @return {Promise<HTMLImageElement>}
   */
  imageFromUrl (url) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = e => reject(e)
      image.src = url
    })
  },

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} mimeType
   * @param {number=} quality
   *
   * @return {Promise<Blob>}
   */
  canvasToBlob (canvas, mimeType, quality) {
    // @ts-ignore
    return pica.toBlob(canvas, mimeType, quality)
  },

  /**
   * @param {HTMLImageElement} image
   * @param {number} size
   * @param {Object=} settings
   *
   * @return {Promise<{ raw: HTMLCanvasElement, dimensions: {w:number, h:number} }>}
   */
  resize (image, size, settings) {
    settings = { ...this.defaultResizeSettings, ...settings }
    return this.picaResize(image, size, settings)
      .then(canvas => {
        return { raw: canvas, dimensions: this.picDimensions(canvas) }
      })
  },

  /**
   * @param {HTMLImageElement} image
   * @param {number} size
   *
   * @return {Promise<HTMLCanvasElement>}
   */
  basicResize (image, size) {
    const canvas = this.createCanvas(image, size)
    canvas
      .getContext('2d')
      .drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height)
    return Promise.resolve(canvas)
  },

  /**
   * @param {HTMLImageElement} image
   * @param {number} size
   * @param {Object=} settings
   *
   * @return {Promise<HTMLCanvasElement>}
   */
  picaResize (image, size, settings) {
    if (!settings) settings = this.defaultResizeSettings
    const canvas = this.createCanvas(image, size)
    // @ts-ignore
    return pica.resize(image, canvas, settings)
      .catch(e => {
        if (e.message !== 'The ImageBitmap could not be allocated.') {
          throw e
        }
      })
      .then(() => {
        return this.basicResize(image, Math.max(image.width, image.height))
          // @ts-ignore
          .then(res => pica.resize(res, canvas, settings))
          .catch(e => {
            // console.warn('%c resize ON Err %c e.message: ', 'background:#ffbb00;color:#000', 'color:#00aaff', e.message)
          })
      })
  },

  /**
   * @param {HTMLImageElement} image
   * @param {number} size
   *
   * @return {HTMLCanvasElement}
   */
  createCanvas (image, size) {
    const canvas = document.createElement('canvas')
    const w = image.width
    const h = image.height
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
   * @param {HTMLImageElement|HTMLCanvasElement} pic
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
