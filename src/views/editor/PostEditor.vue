<template>
  <div class="post-editor">
    <dropdown-select
      v-model="postStatus"
      label="Publication Status"
      :options="postStatusList"
      class="mr-base"/>
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

<script>
import PostEditorMixin from '../../mixins/post-editor'
import PxInput from '../components/UI/inputs/PxInput'
import TextEditor from '../components/UI/TextEditor'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import TagsInput from '../components/UI/inputs/TagsInput'
import DropdownSelect from '../components/UI/DropdownSelect'

export default {
  name: 'PostEditor',
  mixins: [PostEditorMixin],
  components: { DropdownSelect, TagsInput, PxInput, TextEditor, AttachmentsEditor },
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
