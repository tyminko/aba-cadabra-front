import { mapActions } from 'vuex'
import DOMPurify from 'dompurify'
import * as date from '../lib/date'

export default {
  data: function () {
    return {
      unsubscribe: null,
      collectionRef: null,
      postData: {}
    }
  },

  computed: {
    postId () { return this.$route.params.id },

    tags () { return this.postData.tags || [] },

    title () {
      if (!this.postData) return ''
      return this.postData.title
    },

    formattedDate () {
      return date.format((this.postData || {}).date, 'full', 'de')
    },

    content () {
      if ((this.postData || {}).content) {
        return DOMPurify.sanitize(this.postData.content)
      }
      return ''
    },

    attachments () {
      const count = Object.keys((this.postData || {}).attachments || {}).length
      if (!count) return []
      return Object.entries(this.postData.attachments).reduce((res, [id, item]) => {
        const { preview, full, original } = item.srcSet
        const src = full || (preview || {}).size > original.size ? preview : original
        res.push({ id, type: item.type, url: src.url, dimensions: src.dimensions, caption: item.caption })
        return res
      }, [])
    },

    author () {
      if (this.postData.author) {
        return this.postData.author
      } else if (this.user) {
        const { displayName, uid } = this.user
        return { displayName, uid }
      }
      return null
    },

    authorId () { return (this.author || {}).uid },
    postStatus () { return this.postData.status }
  },

  created () {
    this.subscribeToPost()
  },

  watch: {
    user () {
      if (!this.user && this.postData && this.postData.status !== 'public') {
        // !!! DEBUG !!!
        console.log(`%c user() %c this.postData: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.postData)
        // this.$router.push({ name: 'home' })
        this.unsubscribePost()
        this.subscribeToPost()
      }
    },
    $route () {
      this.unsubscribePost()
      this.subscribeToPost()
    }
  },

  beforeDestroy () {
    this.unsubscribePost()
  },

  methods: {
    ...mapActions(['showEditor']),
    openEditor () {
      if (this.postData) this.showEditor({ value: this.postData })
    },
    subscribeToPost () {
      if (!this.collectionRef) {
        console.error('SUBSCRIBE TO POST: No Collection Reference defined.')
        return
      }
      if (!this.postId) {
        console.error('SUBSCRIBE TO POST: No Post ID provided.')
        return this.unsubscribePost()
      }
      this.unsubscribe = this.collectionRef.doc(this.postId)
        .onSnapshot(doc => {
          this.postData = { ...doc.data(), id: doc.id }
        }, err => {
          if (err.code === 'permission-denied') {
            if (!this.user) {
              this.$router.push({ name: 'login' })
            } else {
              this.$router.push({ name: 'home' })
            }
          }
          console.error(`SUBSCRIBE TO POST Error code: ${err.code}`, err)
        })
    },

    async closeConfirmation () {
    },

    unsubscribePost () {
      if (typeof this.unsubscribe === 'function') this.unsubscribe()
      this.postData = {}
    }
  }
}
