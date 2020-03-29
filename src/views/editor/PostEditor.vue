<template>
  <div class="post-editor">
    <tags-input v-if="adminOrEditor" v-model="tags" label="Tags"/>
    <attachments-editor
      ref="attachments-editor"
      v-model="attachments"
      :author-id="authorId"
      :poster="posterId"
      @remove="onRemoveAttachment"
      @set-poster="posterId = $event"/>
    <px-input
      v-model="postData.title"
      :placeholder="`${postData.type ||type} title`"
      class="xl"/>
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
### excerpt: TEXTAREA
### attachments: UPLOADER
### location: Google map
### countNumber: auto-counter
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
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
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
  }
}
</script>
