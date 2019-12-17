<template>
  <div class="work-editor">
    Work
    <labeled-input v-model="title" label="Title" class="title" />
    <labeled-input v-model="text" label="Description" class="text" />
    <attachments v-model="attachments" @remove="removeAttachment" />
    <div class="work-form">
      <div v-for="(propValue, propName) in work" :key="propName">
        {{ `${propName}: ${propValue}` }}
      </div>
    </div>
    <popover-dialog :open="!!message" :message="message" @cencel="mesage=null">
      <div>{{ message }}</div>
    </popover-dialog>
  </div>
</template>

<script>
/**
   @typedef {{
 file?: File
 image?: HTMLImageElement
    *
 }}
   */

import { mapState } from 'vuex'
import Work from '../../lib/work'
import { deleteAttachments } from '../../lib/storage'
import localData from '../../lib/local-storage'
import LabeledInput from './UI/LabeledInput'
import Attachments from './UI/Attachments'
import PopoverDialog from './UI/PopoverDialog'

export default {
  name: 'WorkEditor',
  components: { LabeledInput, Attachments, PopoverDialog },

  props: {
    work: { type: Object, default: null },
    imageSizes: { type: Object, default: () => ({ full: 2048, preview: 512 }) }
  },

  data: () => ({
    isOpen: true,
    title: '',
    text: '',
    type: '',
    technicalDescription: '',
    credits: [],
    published: true,
    attachments: {},
    attachmentsToRemove: {},
    message: ''
  }),

  computed: {
    ...mapState(['user']),

    draft () {
      return {
        title: this.title,
        text: this.text,
        attachments: this.attachments
      }
    },

    workData () {
      return {
        title: this.title || 'Untitled',
        text: this.text,
        type: '',
        technicalDescription: '',
        posterImage: null,
        workCreatedAt: null,
        credits: [{ role: 'author', name: this.user.displayName }],
        order: 0,
        published: true
      }
    }
  },

  watch: {
    work () {
      this.setup()
    }
  },

  mounted () {
    this.setup()
  },

  methods: {
    setup () {
      if (this.work) {
        this.title = this.work.title || ''
        this.text = this.work.text || ''
        this.type = this.work.type || ''
        this.technicalDescription = this.work.technicalDescription || ''
        this.credits = this.work.credits || []
        this.published = this.work.published || true
        this.attachments = this.work.attachments || {}
      }
    },

    removeAttachment (key) {
      this.attachmentsToRemove[key] = this.attachments[key]
      this.$delete(this.attachments, key)
    },

    close () {
      return this.saveWork().then(() => {
        this.$emit('add-work', { ...this.workData })
        return 'close'
      })
        .catch(e => {
          // console.warn('%c CLOSE %c e.message: ', 'background:#ffbb00;color:#000', 'color:#00aaff', e.message)
        })
    },

    saveWork () {
      if (this.work && this.work.id) {
        return Work.update(this.user.id, this.work.id, this.workData, this.attachments)
          .then(() => deleteAttachments(this.user.id, this.attachmentsToRemove))
      } else {
        return Work.create(this.user.id, this.workData, this.attachments)
      }
    },

    saveLocalDraft () {
      localData.set('unsavedDraft', this.draft)
    },

    uploadFileStruct (name, sizeType, blob, attachmentId) {
      return { name, sizeType, blob, attachmentId }
    }
  }
}
</script>

<style lang='scss'>
  .work-editor {
    position: relative;
  }
</style>
