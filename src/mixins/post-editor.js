import { mapState } from 'vuex'
import { db } from '../lib/firebase'
import tagsLib from '../lib/tags'
import * as string from '../lib/string'

export default {
  props: {
    value: { type: Object, default: () => ({}) },
    collectionName: { type: String, default: 'posts' }
  },

  data: function () {
    return {
      postData: {},
      emptyPostData: {
        author: null,
        type: 'post',
        title: '',
        attachments: null,
        thumbnail: '',
        content: '',
        excerpt: '',
        userExcerpt: false,
        tags: null,
        status: 'public'
      },
      emptyPostExtraData: {},
      postStatusList: { public: 'Public', internal: 'Internal', draft: 'Draft' },
      collectionRef: null
    }
  },

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    isAuthor () {
      return ((this.value || {}).author || {}).uid === this.user.uid
    },

    defaultPostData () { return { ...this.emptyPostData, ...this.emptyPostExtraData } },

    tags: {
      get () { return this.postData.tags || [] },
      set (newValue) {
        this.$set(this.postData, 'tags', newValue)
        this.postData.tagIds = this.postData.tags.map(t => t.id)
      }
    },
    content: {
      get () { return this.postData.content },
      set (newValue) {
        this.$set(this.postData, 'content', newValue)
        if (!this.postData.userExcerpt) {
          this.postData.excerpt = string.makeExcerpt(newValue, 80)
        }
      }
    },
    excerpt: {
      get () { return this.postData.excerpt },
      set (newValue) {
        this.$set(this.postData, 'excerpt', newValue)
        this.postData.userExcerpt = true
      }
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
      if (this.postData.author) {
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
    },

    postStatus: {
      get () { return this.postData.status },
      set (newValue) { this.$set(this.postData, 'status', newValue) }
    },

    allowDelete () {
      return (this.adminOrEditor || this.isAuthor) && (this.value || {}).id
    }
  },

  watch: {
    value (value) { this.setPostData() },
    user () { this.$emit('allowDelete', this.allowDelete) }
  },

  created () {
    this.collectionRef = db.collection(this.collectionName)
    this.setPostData()
  },

  mounted () {
    this.$emit('allowDelete', this.allowDelete)
  },

  methods: {
    setPostData () {
      this.postData = this.value
        ? JSON.parse(JSON.stringify(this.value))
        : { ...this.defaultPostData }
    },

    async save () {
      if (!this.postData.author) this.postData.author = this.author
      if (!this.postData.author) throw new Error('Cant save post without author!')
      try {
        this.$emit('setProcessing', true)
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

        if (!this.postData.date) {
          this.postData.date = new Date().getTime()
        }

        if ((this.value || {}).id) {
          await this.collectionRef.doc(this.value.id).update(this.postData)
        } else {
          await this.collectionRef.add(this.postData)
        }
        this.$emit('setProcessing', false)
        this.$emit('saved')
      } catch (e) {
        this.$emit('setProcessing', false)
        console.error('%c savePost() %c e: ', 'background:#ff00AA;color:#000', 'color:#00aaff', e)
      }
    },

    async remove () {
      if (!this.allowDelete) {
        console.error('%c Remove Post %c e: ', 'background:#ff00AA;color:#000', 'color:#00aaff', 'Deleting is not allowed.')
        return
      }
      try {
        this.$emit('setProcessing', true)
        await this.collectionRef.doc(this.value.id).update({ status: 'trash' })
        if (typeof this.afterDeleteFunc === 'function') this.afterDeleteFunc()
        this.$emit('setProcessing', false)
        this.$emit('deleted')
        this.$emit('close')
      } catch (e) {
        this.$emit('setProcessing', false)
        console.error('%c Remove Post %c e: ', 'background:#ff00AA;color:#000', 'color:#00aaff', e)
      }
    },

    afterDeleteFunc () {},

    onRemoveAttachment (id) {
      if (id === this.posterId) {
        this.posterId = ''
      }
    }
  }
}
