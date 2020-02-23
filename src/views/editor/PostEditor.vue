<template>
  <popover-modal :open="open"
                 class="editor w-full max-w-text"
                 @close="close">
    <form @submit.prevent="savePost" class="post-editor pb-base">
      <div class="form-body px-base pb-base overflow-auto">
        <px-input v-model="postData.title"
                  :placeholder="`${type} title`"
                  class="xl"/>
        <label class="px-label mb-0" :class="{focus:textEditorFocused}">
          <span>Content</span>
        </label>
        <text-editor v-model="postData.content" @focus="textEditorFocused=true" @blur="textEditorFocused=false"/>
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
import TextEditor from '../components/UI/TextEditor'

export default {
  name: 'PostEditor',
  components: { PopoverModal, PxInput, TextEditor },
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
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit officiis deleniti voluptate cupiditate minus veritatis eligendi dolorum itaque nulla tenetur dolores quaerat molestiae harum, nihil consequuntur reiciendis natus aut facere.',
      excerpt: '',
      gallery: '',
      countNumber: '',
      participants: '',
      supportedBy: '',
      tags: ''
    },
    textEditorFocused: false
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

<!--suppress CssInvalidFunction -->
<style lang="css">
  .form-body {
    max-height: calc(100vh - theme('padding.base') * 3 - theme('spacing.base') * 2);
  }
  .form-body .px-label.mb-0 {
    @apply mb-0;
  }
</style>
