<template>
  <div class="post-editor">
    <dropdown-select
      v-model="postStatus"
      label="Publication Status"
      :options="postStatusList"
      class="mr-base"/>
    <px-input
      v-model="postData.title"
      placeholder="Page title"
      class="xl"/>
    <tags-input v-if="adminOrEditor" v-model="tags" label="Tags"/>
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

<script>
import { db } from '../../lib/firebase'
import PostEditorMixin from '../../mixins/post-editor'
import {
  addPublicMenuItem,
  manageUpdatePublicMenuItem,
  removePublicMenuItem
} from '../../lib/public-menu'
import PxInput from '../components/UI/inputs/PxInput'
import TextEditor from '../components/UI/TextEditor'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import TagsInput from '../components/UI/inputs/TagsInput'
import DropdownSelect from '../components/UI/DropdownSelect'
import tagsLib from '../../lib/tags'

export default {
  name: 'PostEditor',
  mixins: [PostEditorMixin],
  components: { DropdownSelect, TagsInput, PxInput, TextEditor, AttachmentsEditor },
  props: {
    open: { type: Boolean, required: true },
    value: { type: Object, default: null }
  },

  data: () => ({
    postData: {},
    posterTempId: '',
    textEditorFocused: false,
    unsubscribe: null,
    institutions: null
  }),

  computed: {
    allowDelete () {
      return this.adminOrEditor && (this.value || {}).id
    }
  },

  created () {
    this.collectionRef = db.collection('pages')
  },

  mounted () {
    this.$emit('allowDelete', this.allowDelete)
  },

  methods: {
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

        const original = (this.value || {})
        if (original.id) {
          const newStatus = this.postData.status !== original.status ? this.postData.status : null
          const titleIsNew = this.postData.title !== original.title

          await this.collectionRef.doc(this.value.id).update(this.postData)
          await manageUpdatePublicMenuItem(original.id, 'page', newStatus, this.postData.title, titleIsNew)
        } else {
          const newPost = await this.collectionRef.add(this.postData)
          await addPublicMenuItem(newPost.id, 'page', this.postData.title)
        }
        this.$emit('setProcessing', false)
        this.$emit('saved')
        this.$emit('close')
      } catch (e) {
        this.$emit('setProcessing', false)
        console.error(`%c savePost() %c e: `, 'background:#ff00AA;color:#000', 'color:#00aaff', e)
      }
    },
    async afterDeleteFunc () {
      await removePublicMenuItem(this.value.id)
    }
  }
}
</script>
