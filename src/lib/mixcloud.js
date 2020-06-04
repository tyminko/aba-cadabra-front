import axios from 'axios'
import jsonpAdapter from 'axios-jsonp'
import simpleId from './simpleId'

export default {
  /**
   * @param {?string} url
   * @return {boolean}
   */
  isMixCloudUrl (url) {
    if (!url || !(typeof url === 'string' || url instanceof String)) {
      return false
    }
    return /https:\/\/(www.)?mixcloud.com\/.+/.test(url)
  },
  /**
   * @param {string} url
   * @return {Promise<MixcloudEmbedData>}
   */
  getMixCloudUrlInfo (url) {
    const embedUrl = `https://www.mixcloud.com/oembed/?url=${encodeURIComponent(url)}`
    return axios({ url: embedUrl, adapter: jsonpAdapter })
      .then(response => {
        return response.data
      })
      .catch(error => {
        if (error.response) {
          throw new Error(error.response.data)
        } else if (error.request) {
          throw new Error('network/request-failed')
        }
        throw new Error('network/invalid-request')
      })
  },
  /**
   * @param {MixcloudEmbedData} embedData
   * @return {PostEmbedAttachment}
   */
  async castEmbedToAttachment (embedData) {
    // const imgDimensions = await imageDimensionsFromUrl()
    return {
      id: simpleId(),
      type: 'embed/mixcloud',
      name: embedData.title,
      html: embedData.html,
      srcSet: {
        full: {
          url: embedData.image,
          dimensions: null
        },
        original: {
          url: embedData.url,
          dimensions: null
        }
      },
      order: null,
      err: null
    }
  }
}
