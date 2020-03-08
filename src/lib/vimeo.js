import axios from 'axios'

export default {
  /**
   * @param {?string} url
   * @return {boolean}
   */
  isVimeoVideoUrl (url) {
    if (!url || !(typeof url === 'string' || url instanceof String)) {
      return false
    }
    // !!! DEBUG !!!
    console.log(`%c isVimeoVideoUrl() %c url: `, 'background:#ffbb00;color:#000', 'color:#00aaff', url)
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
  }
}
