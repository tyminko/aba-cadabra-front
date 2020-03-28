<template>
  <div class="post-editor">
    <tags-input v-model="tags" label="Tags"/>
    <px-input
      v-model="postData.title"
      :placeholder="`${postData.type ||type} title`"
      class="xl"/>
    <attachments-editor
      ref="attachments-editor"
      v-model="attachments"
      :author-id="authorId"
      :poster="posterId"
      @remove="onRemoveAttachment"
      @set-poster="posterId = $event"/>
    <text-editor
        ref="text-editor"
        v-model="content"
        label="Content"/>
  </div>
</template>
<!--
### type: DROPDOWN
### partOfProgramme: DROPDOWN
### title: INPUT
### date: DATE PICKER
### dateEnd: date picker
### status: dropdown
### content: EDITABLE / TEXT EDITOR
excerpt: TEXTAREA
#### attachments: UPLOADER
### location: Google map
countNumber: auto-counter
### participants: AUTOCOMPLETE (profiles)
### supportedBy: autocomplete (institutions)
### tags: autocomplete (tags)
-->

<script>
import { mapState } from 'vuex'
import PostEditorMixin from '../../mixins/post-editor'
import PxInput from '../components/UI/inputs/PxInput'
import TextEditor from '../components/UI/TextEditor'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import TagsInput from '../components/UI/inputs/TagsInput'

export default {
  name: 'PostEditor',
  mixins: [PostEditorMixin],
  components: { TagsInput, PxInput, TextEditor, AttachmentsEditor },
  props: {
    open: { type: Boolean, required: true },
    value: { type: Object, default: null },
    type: { type: String, default: 'post', validator: v => !v || ['post', 'event'].includes(v) }
  },

  data: () => ({
    postData: {},
    postTypes: {
      salons: 'Event',
      post: 'Blog Post'
    },
    posterTempId: '',
    textEditorFocused: false,
    unsubscribe: null,
    institutions: null
  }),

  computed: {
    ...mapState(['user']),

    title: {
      get () { return '' }
    },

    // content: {
    //   get () { return this.postData.content },
    //   set (newValue) { this.postData.content = newValue }
    // },

    // tags: {
    //   get () { return this.postData.tags || [] },
    //   set (newValue) {
    //     this.$set(this.postData, 'tags', newValue)
    //     this.postData.tagIds = this.postData.tags.map(t => t.id)
    //   }
    // },

    date: {
      get () { return this.postData.date || '' },
      set (newValue) { this.postData.date = new Date(newValue).getTime() }
    },

    // attachments: {
    //   get () {
    //     return Object.entries({
    //       ...(this.postData.gallery || {}),
    //       ...(this.postData.attachments || {})
    //     })
    //       .map(([id, item]) => ({ ...item, id }))
    //   }
    // },
    postType: {
      get () { return this.type },
      set (newValue) {

      }
    }
    // author () {
    //   if (this.postData && this.postData.author) {
    //     return this.postData.author
    //   } else if (this.user) {
    //     const { displayName, uid } = this.user
    //     return { displayName, uid }
    //   }
    //   return null
    // },
    // authorId () { return (this.author || {}).uid },
    //
    // posterId: {
    //   get () { return this.posterTempId || (this.postData.thumbnail || {}).id || '' },
    //   set (newValue) {
    //     this.posterTempId = newValue
    //   }
    // }
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
    preventEnter (e) {
      return false
    },

    onEsc (e) {
      e.stopImmediatePropagation()
      let escaped = false
      if (this.$refs['date']) {
        escaped = this.$refs['date'].onEsc(e)
        if (escaped) return
      }
      if (this.$refs['text-editor']) {
        escaped = this.$refs['text-editor'].onEsc(e)
        if (escaped) return
      }
      this.close()
    },

    addAttachment () {
      if (this.$refs['attachments-editor']) {
        this.$refs['attachments-editor'].openFileDialog()
      }
    },

    embedUrl () {
      if (this.$refs['attachments-editor']) {
        this.$refs['attachments-editor'].openEmbedDialog()
      }
    },

    // onRemoveAttachment (id) {
    //   if (id === this.posterId) {
    //     this.posterId = ''
    //   }
    // },

    close () {
      const allSave = true
      if (allSave) {
        if (this.unsubscribe) this.unsubscribe()
        this.postData = { ...this.emptyPostData }
        this.$emit('close')
      }
    },

    setPostData () {
      this.postData = this.value
        ? JSON.parse(JSON.stringify(this.value))
        : { ...this.emptyPostData }
    }

    // async save () {
    //   const attachmentsEditor = this.$refs['attachments-editor']
    //   if (!attachmentsEditor) return
    //   try {
    //     const attachmentsData = await attachmentsEditor.processAttachments()
    //     this.$set(this.postData, 'attachments', attachmentsData)
    //     if (this.posterTempId) {
    //       this.$set(this.postData, 'thumbnail', this.posterTempId)
    //     }
    //
    //     if ((this.postData.tags || []).length) {
    //       await Promise.all(this.postData.tags.filter(tag => tag.new).map(tag => {
    //         return tagsLib.saveTag(tag)
    //       }))
    //       this.postData.tags = this.postData.tags.map(tag => ({ id: tag.id, title: tag.title }))
    //     }
    //     // !!! DEBUG !!!
    //     console.log(`%c savePost() %c this.postData: `, 'background:#ffbbff;color:#000', 'color:#00aaff', this.postData)
    //     db.collection('posts').doc(this.value.id).update(this.postData)
    //   } catch (e) {
    //     console.error(`%c savePost() %c e: `, 'background:#ff00AA;color:#000', 'color:#00aaff', e)
    //   }
    // },
  }
}
</script>
