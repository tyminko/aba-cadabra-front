<template>
  <div>
    <dropdown-select
      v-model="postStatus"
      label="Publication Status"
      :options="postStatusList"
      class="mr-base"/>
    <attachments-editor
      ref="attachments-editor"
      :value="logo"
      :max-number="1"
      no-caption
      no-url
      no-crop
      dropzone-message="Drop Logo Image Here"/>
    <px-input
      ref="title"
      v-model="postData.title"
      :required="true"
      :placeholder="`Partner name`"
      @validated="validateForm"
      class="xl"/>
    <px-input
      ref="country"
      v-model="postData.country"
      :required="true"
      @validated="validateForm"
      placeholder="Country"/>
    <px-input
      ref="url"
      v-model="postData.url"
      :required="true"
      @validated="validateForm"
      placeholder="Link"/>
  </div>
</template>

<script>
import PxInput from '../components/UI/inputs/PxInput'
import postEditor from '../../mixins/post-editor'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import DropdownSelect from '../components/UI/DropdownSelect'
// import { db } from '../../lib/firebase'

export default {
  name: 'InstitutionEditor',
  components: { DropdownSelect, AttachmentsEditor, PxInput },
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
    attachments () { return Object.values(this.postData.attachments || {}) },
    logo () {
      return this.postData.logo
        ? [this.postData.logo]
        : this.attachments.length
          ? [this.attachments[0]]
          : []
    }
  },

  methods: {
    validateForm () {
      const fields = ['title', 'country', 'url']
      const errorField = fields.find(ref => (this.$refs[ref] || {}).isValid !== true)
      this.$emit('validated', !errorField)
    }
  }
}
</script>

<style lang="scss">
  .institution-editor {
  }
</style>
