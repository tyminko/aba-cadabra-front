<template>
  <popover-modal :open="open"
                 class="editor w-full max-w-text"
                 @close="close">
    <form @submit.prevent="savePost"
          class="post-editor pb-base">
      <div class="form-body px-base pb-base overflow-auto">
        <px-input v-model="postData.title"
                  :placeholder="`${type} title`"
                  class="xl"/>
<!--        <px-input v-model="postData.content"-->
<!--                  placeholder="Text"-->
<!--                  type="textarea"/>-->
        <label class="px-label">
          <span>Content</span>
        </label>
        <div class="toolbar h-2/3 flex justify-center sticky top-0 bg-white">
          <button class="w-2/3base mr-sm" @click.stop="commandBold">
            <i class="material-icons text-xl text-gray-600">format_bold</i>
          </button>
          <button class="w-2/3base mr-sm"><i class="material-icons text-xl text-gray-600">format_italic</i></button>
          <button class="w-2/3base"><i class="material-icons text-xl text-gray-600">insert_link</i></button>
        </div>
          <div ref="content" contenteditable="true"
               placeholder="Text"
               class="editor min-h-base px-sm py-base focus:outline-none"
               @input="updateContent">
            text
          </div>
        <div v-html="postData.content"/>
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
    commandBold () {
      document.execCommand('bold')
    },
    updateContent (e) {
      this.$set(this.postData, 'content', this.$refs.content.innerHTML)
    },
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

<style lang="css">
  .form-body {
    max-height: calc(100vh - theme('padding.base') * 3 - theme('spacing.base') * 2);
  }
  .editor:after {
    content: '';
    display: block;
    width: 100%;
    height: 0;
    border-bottom: 1px solid theme('colors.aba-blue-semi');
    position: sticky;
    transform: translateY(theme('padding.base'));
    bottom: 0;
  }
  .editor:focus:after {
    @aply border-b-aba-blue;
  }
</style>
