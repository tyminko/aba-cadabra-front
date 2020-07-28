/**
 * maxim tyminko 24.07.20.
 * maximtyminko.com
 */
import PDFJS from 'pdfjs-dist'
// eslint-disable-next-line import/no-webpack-loader-syntax
import PdfjsWorker from 'worker-loader!pdfjs-dist/es5/build/pdf.worker.js'
import imageLib from './image'
import { imageSizeTypes } from './storage'

PDFJS.GlobalWorkerOptions.workerPort = new PdfjsWorker()

export function imageFromPdf (url) {
  // Loading a document.
  const loadingTask = PDFJS.getDocument(url)

  return loadingTask.promise
    .then(pdfDocument => {
      // Request a first page
      return pdfDocument.getPage(1).then(function (pdfPage) {
        // Display page on the existing canvas with 100% scale.
        let viewport = pdfPage.getViewport({ scale: 1.0 })
        const maxSide = imageSizeTypes.full
        const { width, height } = viewport
        const ratio = width / height
        let w, h
        if (width >= height) {
          w = maxSide
          h = maxSide / ratio
        } else {
          w = maxSide * ratio
          h = maxSide
        }
        viewport = pdfPage.getViewport({ scale: w / width })
        const canvas = imageLib.createCanvas({ w, h })
        const renderTask = pdfPage.render({
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        })
        return renderTask.promise
          .then(() => {
            return canvas
          })
      })
    })
    .catch(reason => {
      console.error(`%c imageFromPdf ERROR %c: `, 'background:#ff0000;color:#000', 'color:#00aaff', reason)
    })
}
