<template>
  <popover-modal
    ref="popover"
    :open="open"
    class="editor"
    @esc="onEsc"
    @close="close">
    <form
      class="post-editor pb-base"
      @submit.prevent="savePost"
      @keyup.enter.prevent="preventEnter">
      <div ref="" class="form-body w-text px-base pb-base overflow-auto">
        <px-input
          v-model="postData.title"
          :placeholder="`${type} title`"
          class="xl"/>
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
        <attachments-editor
          ref="attachments-editor"
          v-model="attachments"
          :author-id="authorId"
          :poster="posterId"
          @remove="onRemoveAttachment"
          @set-poster="posterId = $event"/>
        <label class="px-label mb-0" :class="{focus:textEditorFocused}">
          <span>Content</span>
        </label>
        <text-editor
          ref="text-editor"
          v-model="postData.content"
          @focus="textEditorFocused=true"
          @blur="textEditorFocused=false"/>
      </div>
      <footer class="flex h-base items-center px-sm">
        <button class="flex-col h-auto leading-none" @click.prevent="addAttachment">
          <i class="material-icons">attachment</i>
          <span class="text-xs text-gray-600 text-center mt-1">Attach File</span>
        </button>
        <button class="flex-col h-auto leading-none" @click.prevent="embedUrl">
          <i class="material-icons">link</i>
          <span class="text-xs text-gray-600 text-center mt-1">Embed Url</span>
        </button>
        <button class="ml-auto" @click.prevent="close">Cancel</button>
        <button type="submit">Save</button>
      </footer>
<!--
type: DROPDOWN
### title: INPUT
### date: DATE PICKER
### dateEnd: date picker
status: dropdown
### content: EDITABLE / TEXT EDITOR
excerpt: TEXTAREA
attachments: UPLOADER
countNumber: auto-counter
participants: AUTOCOMPLETE (profiles)
supportedBy: autocomplete (institutions)
tags: autocomplete (tags)
-->
    </form>
  </popover-modal>
</template>

<script>
import { mapState } from 'vuex'
import { db } from '../../lib/firebase'
import PopoverModal from '../components/UI/PopoverModal'
import PxInput from '../components/UI/inputs/PxInput'
import DateTimePicker from '../components/UI/inputs/DateTimePicker'
import TextEditor from '../components/UI/TextEditor'
import AttachmentsEditor from './attachments/AttachmentsEditor'

export default {
  name: 'PostEditor',
  components: { PopoverModal, PxInput, TextEditor, DateTimePicker, AttachmentsEditor },
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
    posterTempId: '',
    textEditorFocused: false,
    unsubscribe: null
  }),

  computed: {
    ...mapState(['user']),

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
    attachments: {
      get () {
        return Object.entries({
          ...(this.postData.gallery || {}),
          ...(this.postData.attachments || {})
        })
          .map(([id, item]) => ({ ...item, id }))
      }
    },
    postType: {
      get () { return this.type },
      set (newValue) {

      }
    },
    author () {
      if (this.postData && this.postData.author) {
        return this.postData.author
      } else if (this.user) {
        const { displayName, uid } = this.user
        return { displayName, uid }
      }
      return null
    },
    authorId () { return (this.author || {}).uid },

    posterId: {
      get () { return this.posterTempId || (this.postData.thumbnail || {}).id || '' },
      set (newValue) {
        this.posterTempId = newValue
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

    onRemoveAttachment (id) {
      if (id === this.posterId) {
        this.posterId = ''
      }
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
    },

    async savePost (e) {
      const attachmentsEditor = this.$refs['attachments-editor']
      if (!attachmentsEditor) return
      try {
        const attachmentsData = await attachmentsEditor.processAttachments()
        this.$set(this.postData, 'attachments', attachmentsData)
        if (this.posterTempId) {
          const attachment = this.postData.attachments.find(a => a.id === this.posterTempId)
          if (attachment) {
            this.$set(this.postData, 'thumbnail', attachment)
          }
        }
        // !!! DEBUG !!!
        console.log(`%c savePost() %c attachmentsData: `, 'background:#ffbb00;color:#000', 'color:#00aaff', attachmentsData)
        // !!! DEBUG !!!
        console.log(`%c savePost() %c this.postData: `, 'background:#ff0000;color:#000', 'color:#00aaff', this.postData)
      } catch (e) {
        console.error(`%c savePost() %c e: `, 'background:#ff00AA;color:#000', 'color:#00aaff', e)
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
