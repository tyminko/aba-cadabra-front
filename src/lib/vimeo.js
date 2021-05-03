import axios from 'axios'
import simpleId from './simpleId'

export default {
  /**
   * @param {?string} url
   * @return {boolean}
   */
  isVimeoVideoUrl (url) {
    if (!url || !(typeof url === 'string' || url instanceof String)) {
      return false
    }
    return /https:\/\/vimeo.com\/(\d+)(?=\b|\/)/.test(url)
  },
  /**
   * @param {?string} url
   * @return {?number}
   */
  getVimeoId (url) {
    const match = url.match(/https:\/\/vimeo.com\/(\d+)(?=\b|\/)/)
    return match ? match[1] : null
  },
  /**
   * @param {string} url
   * @return {Promise<VimeoEmbedData>}
   */
  getVimeoVideoInfo (url) {
    const embedUrl = 'https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(url) + '&maxwidth=90000'
    return axios.get(embedUrl).catch(function (error) {
      if (error.response) {
        throw new Error(error.response.data)
      } else if (error.request) {
        throw new Error('network/request-failed')
      }
      throw new Error('network/invalid-request')
    }).then(response => {
      return response.data
    })
  },

  /**
   * @param {string} url
   * @param {VimeoEmbedData} vimeoEmbed
   * @return {PostAVAttachment}
   */
  castEmbedToAttachment (url, vimeoEmbed) {
    return {
      id: simpleId(),
      name: vimeoEmbed.video_id,
      type: 'embed/vimeo',
      duration: vimeoEmbed.duration,
      srcSet: {
        full: {
          url: vimeoEmbed.thumbnail_url,
          dimensions: { w: vimeoEmbed.thumbnail_width, h: vimeoEmbed.thumbnail_height }
        },
        original: {
          url,
          dimensions: { w: vimeoEmbed.width, h: vimeoEmbed.height }
        }
      },
      order: null,
      caption: vimeoEmbed.description,
      pointOfInterest: null,
      err: null
    }
  }
}
