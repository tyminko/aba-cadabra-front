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
    <dropdown-select
      v-model="template"
      label="Template"
      :options="contentTemplates"
      class="mr-base"/>
    <tags-input v-if="adminOrEditor" v-model="tags" label="Tags"/>
    <credits-input v-model="people" label="People mentioned on the page"/>
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
import PxInput from '../components/UI/inputs/PxInput'
import TextEditor from '../components/UI/TextEditor'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import TagsInput from '../components/UI/inputs/TagsInput'
import DropdownSelect from '../components/UI/DropdownSelect'
import tagsLib from '../../lib/tags'
import CreditsInput from '../components/UI/inputs/CreditsInput'

export default {
  name: 'PostEditor',
  mixins: [PostEditorMixin],
  components: { CreditsInput, DropdownSelect, TagsInput, PxInput, TextEditor, AttachmentsEditor },
  props: {
    open: { type: Boolean, required: true },
    value: { type: Object, default: null }
  },

  data: () => ({
    postData: {},
    emptyPostExtraData: {
      type: 'page',
      template: null,
      relatedPeople: []
    },
    posterTempId: '',
    textEditorFocused: false,
    unsubscribe: null,
    institutions: null,
    contentTemplates: {
      '--': 'Default',
      'Residency': 'AIR',
      'Partners': 'Partners',
      'About': 'About'
    }
  }),

  computed: {
    people: {
      get () { return this.postData.relatedPeople || [] },
      set (newValue) { this.$set(this.postData, 'relatedPeople', newValue) }
    },
    template: {
      get () { return this.postData.template || '--' },
      set (newValue) { this.$set(this.postData, 'template', newValue) }
    },
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
          await this.collectionRef.doc(this.value.id).update(this.postData)
        } else {
          await this.collectionRef.add(this.postData)
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
    }
  }
}
</script>
