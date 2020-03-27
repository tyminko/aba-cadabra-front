export default {
  props: {
    value: { type: Object, default: () => ({}) }
  },

  data: function () {
    return {
      postData: {}
    }
  },

  watch: {
    value (value) {
      this.setPostData()
    }
  },

  created () {
    this.setPostData()
  },

  methods: {
    setPostData () {
      this.postData = this.value
        ? JSON.parse(JSON.stringify(this.value))
        : this.emptyPostData ? { ...this.emptyPostData } : {}
    }
  }
}
