<template>
  <popover-modal :open="open"
                 class="w-full max-w-text"
                 @close="close">
    <form @submit.prevent="savePost"
          class="post-editor pb-base">
      <div class="form-body px-base pb-base">
        <px-input v-model="postData.title"
                  :placeholder="`${type} title`"
                  class="xl"/>
        <px-input v-model="postData.content"
                  placeholder="Text"
                  type="textarea"/>
      </div>
      <footer class="flex h-base items-center justify-end px-sm">
        <button>Cancel</button>
        <button type="submit">Save</button>
      </footer>
<!--
type: DROPDOWN
title: INPUT
date: DATE PICKER
dateEnd: date picker
status: dropdown
content: EDITABLE / TEXT EDITOR
excerpt: TEXTAREA
gallery: UPLOADER
countNumber: auto-counter
participants: AUTOCOMPLETE (profiles)
supportedBy: autocomplete (institutions)
tags: autocomplete (tags)
-->
    </form>
  </popover-modal>
</template>

<script>
import PopoverModal from '../components/UI/PopoverModal'
import PxInput from '../components/UI/inputs/PxInput'
export default {
  name: 'PostEditor',
  components: { PopoverModal, PxInput },
  props: {
    open: { type: Boolean, required: true },
    postId: { type: String, default: '' },
    type: { type: String, default: 'post', validator: v => !v || ['post', 'salons', 'event', 'programme'].includes(v) }
  },

  data: () => ({
    postData: {
      type: '',
      title: '',
      date: '',
      endDate: '',
      status: '',
      content: '',
      excerpt: '',
      gallery: '',
      countNumber: '',
      participants: '',
      supportedBy: '',
      tags: ''
    }
  }),

  computed: {
    title: {
      get () { return '' }
    },
    postType: {
      get () { return this.type },
      set (newValue) {

      }
    }
  },

  methods: {
    savePost () {},
    close () {
      const allSave = true
      if (allSave) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style lang="scss">
  .post-editor {
  }
</style>
