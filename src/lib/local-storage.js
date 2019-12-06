
export default {
  storageName: 'prtfl',

  get (propName) {
    const data = this.validRawData()
    return data.hasOwnProperty(propName) ? data[propName] : null
  },

  set (propName, value) {
    const data = this.validRawData() || {}
    data[propName] = value
    localStorage.setItem(this.storageName, JSON.stringify(data))
  },

  validRawData () {
    const rawData = localStorage.getItem(this.storageName)
    if (!rawData) {
      return null
    } else {
      let data = null
      try {
        data = JSON.parse(rawData)
      } catch (e) {
        localStorage.removeItem(this.storageName)
      }
      return data
    }
  }
}
