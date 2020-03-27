<template>
  <editor-popover
    :open="open"
    :processing="processing"
    @close="$emit('close')"
    @esc="$emit('close')"
    @save="save">
    <attachments-editor
      ref="attachments-editor"
      :value="logo"
      :max-number="1"
      no-caption
      no-url
      no-crop
      dropzone-message="Drop Logo Image Here"/>
    <px-input
      v-model="postData.title"
      :placeholder="`Partner name`"
      class="xl"/>
    <px-input
      v-model="postData.country"
      placeholder="Country"/>
    <px-input
      v-model="postData.url"
      placeholder="Link"/>
  </editor-popover>
</template>

<script>
import EditorPopover from './EditorPopover'
import PxInput from '../components/UI/inputs/PxInput'
import postEditor from '../../mixins/post-editor'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import { db } from '../../lib/firebase'

export default {
  name: 'InstitutionEditor',
  components: { AttachmentsEditor, PxInput, EditorPopover },
  mixins: [postEditor],
  props: {
    open: Boolean
  },

  data: () => ({
    processing: false,
    emptyPostData: {
      title: '',
      logo: null,
      country: '',
      url: ''
    }
  }),

  computed: {
    logo () { return this.postData.logo ? [this.postData.logo] : [] }
  },

  methods: {
    async save (e) {
      this.processing = true
      const attachmentsEditor = this.$refs['attachments-editor']
      if (!attachmentsEditor) return
      try {
        const attachmentsData = await attachmentsEditor.processAttachments()
        this.postData.logo = attachmentsData[0]

        await db.collection('institutions').doc(this.postData.id).update(this.postData)
        this.processing = false
        this.$emit('close')
      } catch (e) {
        this.processing = false
        console.error(`%c savePost() %c e: `, 'background:#ff00AA;color:#000', 'color:#00aaff', e)
      }
    }
  }
}
</script>

<style lang="scss">
  .institution-editor {
  }
</style>
