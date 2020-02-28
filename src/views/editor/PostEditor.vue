<template>
  <popover-modal
    ref="popover"
    :open="open"
    class="editor w-full max-w-text"
    @esc="onEsc"
    @close="close">
    <form
      class="post-editor pb-base"
      @submit.prevent="savePost"
      @keyup.enter.prevent="preventEnter">
      <div ref="" class="form-body px-base pb-base overflow-auto">
        <div class="dates-row">
          <date-time-picker
            ref="date"
            v-model="postData.date"
            required
            label="Date"
            class="mr-base w-1/2 flex-1"/>
          <date-time-picker
            ref="endDate"
            v-model="postData.endDate"
            label="End Date"
            class="w-1/2 flex-1"/>
        </div>
        <px-input
          v-model="postData.title"
          :placeholder="`${type} title`"
          class="xl"/>
        <label class="px-label mb-0" :class="{focus:textEditorFocused}">
          <span>Content</span>
        </label>
        <text-editor ref="text-editor" v-model="postData.content" @focus="textEditorFocused=true" @blur="textEditorFocused=false"/>
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
import { db } from '../../lib/firebase'
import PopoverModal from '../components/UI/PopoverModal'
import PxInput from '../components/UI/inputs/PxInput'
import DateTimePicker from '../components/UI/inputs/DateTimePicker'
import TextEditor from '../components/UI/TextEditor'

export default {
  name: 'PostEditor',
  components: { PopoverModal, PxInput, TextEditor, DateTimePicker },
  props: {
    open: { type: Boolean, required: true },
    postId: { type: String, default: '' },
    type: { type: String, default: 'post', validator: v => !v || ['post', 'salon', 'salons', 'event', 'programme'].includes(v) }
  },

  data: () => ({
    emptyPostData: {
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
    },
    postData: {},
    textEditorFocused: false,
    unsubscribe: null
  }),

  computed: {
    title: {
      get () { return '' }
    },
    date: {
      get () {
        if (!this.postData.date) return ''
        return this.postData.date
      },
      set (newValue) {
        this.postData.date = new Date(newValue).getTime()
      }
    },
    postType: {
      get () { return this.type },
      set (newValue) {

      }
    }
  },

  watch: {
    postId () {
      if (this.unsubscribe) this.unsubscribe()
      this.postData = { ...this.emptyPostData }
      this.getPost()
    }
  },

  created () {
    this.getPost()
  },

  methods: {
    preventEnter (e) {
      // !!! DEBUG !!!
      console.log(`%c preventEnter() %c e: `, 'background:#ffbb00;color:#000', 'color:#00aaff', e)
      return false
    },
    savePost (e) {
      // !!! DEBUG !!!
      console.log(`%c savePost() %c e: `, 'background:#ff0000;color:#000', 'color:#00aaff', e)
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

    close () {
      const allSave = true
      if (allSave) {
        if (this.unsubscribe) this.unsubscribe()
        this.postData = { ...this.emptyPostData }
        this.$refs.popover.releaseBgScroll()
        this.$emit('close')
      }
    },

    getPost () {
      if (!this.postId || !this.type) return
      const type = this.type === 'salon' ? 'salons' : this.type
      console.log(`%c getPost() %c this.postId, type: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.postId, type)
      this.unsubscribe = db.collection(type).doc(this.postId)
        .onSnapshot(doc => {
          const data = doc.data()
          this.postData = { ...this.postData, ...data }
        })
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
<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  @import "../../styles/mixins";
  .form-body {
    .dates-row {
      @apply flex flex-col;
      @include wider-then($max-width-phone * 0.8) {
        flex-flow: row nowrap;
      }
    }
  }
</style>
