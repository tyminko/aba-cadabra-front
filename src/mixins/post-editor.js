import tagsLib from '../lib/tags'
import { db } from '../lib/firebase'

export default {
  props: {
    value: { type: Object, default: () => ({}) }
  },

  data: function () {
    return {
      postData: {},
      emptyPostData: {
        type: '',
        title: '',
        attachments: null,
        thumbnail: '',
        content: '',
        excerpt: '',
        tags: null,
        status: ''
      },
      emptyPostExtraData: {}
    }
  },

  computed: {
    tags: {
      get () { return this.postData.tags || [] },
      set (newValue) {
        this.$set(this.postData, 'tags', newValue)
        this.postData.tagIds = this.postData.tags.map(t => t.id)
      }
    },
    content: {
      get () { return this.postData.content },
      set (newValue) { this.postData.content = newValue }
    },
    attachments: {
      get () {
        return Object.entries({
          ...(this.postData.gallery || {}),
          ...(this.postData.attachments || {})
        })
          .map(([id, item]) => ({ ...item, id }))
      }
    },
    author () {
      if (this.postData && this.postData.author) {
        return this.postData.author
      } else if (this.user) {
        const { displayName, uid } = this.user
        return { displayName, uid }
      }
      return null
    },
    authorId () { return (this.author || {}).uid },

    posterId: {
      get () { return this.posterTempId || (this.postData.thumbnail || {}).id || '' },
      set (newValue) {
        this.posterTempId = newValue
      }
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
        : { ...this.emptyPostData, ...this.emptyPostExtraData }
    },

    async save () {
      try {
        const attachmentsEditor = this.$refs['attachments-editor']
        if (attachmentsEditor) {
          const attachmentsData = await attachmentsEditor.processAttachments()
          this.$set(this.postData, 'attachments', attachmentsData)
          if (this.posterTempId) {
            this.$set(this.postData, 'thumbnail', this.posterTempId)
          }
        }

        if ((this.postData.tags || []).length) {
          await Promise.all(this.postData.tags.filter(tag => tag.new).map(tag => {
            return tagsLib.saveTag(tag)
          }))
          this.postData.tags = this.postData.tags.map(tag => ({ id: tag.id, title: tag.title }))
        }
        // !!! DEBUG !!!
        console.log(`%c savePost() %c this.postData: `, 'background:#ffbbff;color:#000', 'color:#00aaff', this.postData)
        db.collection('posts').doc(this.value.id).update(this.postData)
      } catch (e) {
        console.error(`%c savePost() %c e: `, 'background:#ff00AA;color:#000', 'color:#00aaff', e)
      }
    },

    onRemoveAttachment (id) {
      if (id === this.posterId) {
        this.posterId = ''
      }
    }
  }
}
