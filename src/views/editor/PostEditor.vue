<template>
  <editor-popover
    ref="popover"
    :open="open"
    @esc="onEsc"
    @close="close"
    @save="savePost">
      <dropdown-select v-model="postData.type" label="Type" :options="postTypes"/>
      <credits-input v-model="participants"/>
      <tags-input v-model="tags" label="Tags"/>
      <px-input
        v-model="postData.title"
        :placeholder="`${postData.type ||type} title`"
        class="xl"/>
      <div class="dates-row">
        <date-time-picker
          ref="date"
          v-model="postData.date"
          required
          label="Date"
          class="mr-base flex-1"/>
        <date-time-picker
          ref="endDate"
          v-model="postData.endDate"
          label="End Date"
          class="flex-1"/>
      </div>
      <tags-input v-model="supportedBy" placeholder="Add Institution" label="Supported By"
                  :query="institutionsQuery" :allow-creation="false"/>
      <location v-model="location"/>
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
        v-model="content"
        @focus="textEditorFocused=true"
        @blur="textEditorFocused=false"/>
      <template v-slot:footer>
        <button class="flex-col h-auto leading-none" @click.prevent="addAttachment">
          <i class="material-icons">attachment</i>
          <span class="text-xs text-gray-600 text-center mt-1">Attach File</span>
        </button>
        <button class="flex-col h-auto leading-none" @click.prevent="embedUrl">
          <i class="material-icons">link</i>
          <span class="text-xs text-gray-600 text-center mt-1">Embed Url</span>
        </button>
      </template>
  </editor-popover>
</template>
<!--
type: DROPDOWN
### title: INPUT
### date: DATE PICKER
### dateEnd: date picker
### status: dropdown
### content: EDITABLE / TEXT EDITOR
excerpt: TEXTAREA
#### attachments: UPLOADER
### location: Google map
countNumber: auto-counter
### participants: AUTOCOMPLETE (profiles)
supportedBy: autocomplete (institutions)
### tags: autocomplete (tags)
-->

<script>
import { mapState } from 'vuex'
import { db } from '../../lib/firebase'
import tagsLib from '../../lib/tags'
import PxInput from '../components/UI/inputs/PxInput'
import DateTimePicker from '../components/UI/inputs/DateTimePicker'
import TextEditor from '../components/UI/TextEditor'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import DropdownSelect from '../components/UI/DropdownSelect'
import CreditsInput from '../components/UI/inputs/CreditsInput'
import TagsInput from '../components/UI/inputs/TagsInput'
import Location from '../components/UI/inputs/Location'
import EditorPopover from './EditorPopover'

export default {
  name: 'PostEditor',
  components: { EditorPopover, Location, TagsInput, CreditsInput, DropdownSelect, PxInput, TextEditor, DateTimePicker, AttachmentsEditor },
  props: {
    open: { type: Boolean, required: true },
    post: { type: Object, default: null },
    type: { type: String, default: 'post', validator: v => !v || ['post', 'salon', 'salons', 'event', 'programme'].includes(v) }
  },

  data: () => ({
    postData: {},
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
    postTypes: {
      salons: 'Salon',
      post: 'Blog Post',
      event: 'Event',
      programme: 'Programme'
    },
    posterTempId: '',
    textEditorFocused: false,
    unsubscribe: null,
    institutions: null
  }),

  computed: {
    ...mapState(['user']),

    title: {
      get () { return '' }
    },

    content: {
      get () { return this.postData.content },
      set (newValue) { this.postData.content = newValue }
    },

    participants: {
      get () { return this.postData.participants || [] },
      set (newValue) { this.$set(this.postData, 'participants', newValue) }
    },

    tags: {
      get () { return this.postData.tags || [] },
      set (newValue) {
        this.$set(this.postData, 'tags', newValue)
        this.postData.tagIds = this.postData.tags.map(t => t.id)
      }
    },

    supportedBy: {
      get () { return this.postData.supportedBy },
      set (newValue) { this.$set(this.postData, 'supportedBy', newValue) }
    },

    location: {
      get () { return this.postData.location || {} },
      set (newValue) { this.$set(this.postData, 'location', newValue) }
    },

    date: {
      get () { return this.postData.date || '' },
      set (newValue) { this.postData.date = new Date(newValue).getTime() }
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
    post (value) {
      this.setPostData()
    }
  },

  created () {
    this.setPostData()
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
        this.$emit('close')
      }
    },

    setPostData () {
      this.postData = this.post
        ? JSON.parse(JSON.stringify(this.post))
        : { ...this.emptyPostData }
    },

    async savePost (e) {
      const attachmentsEditor = this.$refs['attachments-editor']
      if (!attachmentsEditor) return
      try {
        const attachmentsData = await attachmentsEditor.processAttachments()
        this.$set(this.postData, 'attachments', attachmentsData)
        if (this.posterTempId) {
          this.$set(this.postData, 'thumbnail', this.posterTempId)
        }

        if ((this.postData.tags || []).length) {
          await Promise.all(this.postData.tags.filter(tag => tag.new).map(tag => {
            return tagsLib.saveTag(tag)
          }))
          this.postData.tags = this.postData.tags.map(tag => ({ id: tag.id, title: tag.title }))
        }
        // !!! DEBUG !!!
        console.log(`%c savePost() %c this.postData: `, 'background:#ffbbff;color:#000', 'color:#00aaff', this.postData)
        db.collection('posts').doc(this.post.id).update(this.postData)
      } catch (e) {
        console.error(`%c savePost() %c e: `, 'background:#ff00AA;color:#000', 'color:#00aaff', e)
      }
    },

    async institutionsQuery (str) {
      if (!this.institutions) {
        this.institutions = await db.collection('institutions')
          .get()
          .then(snapshot => {
            return snapshot.docs.map(doc => {
              const { title } = doc.data()
              return { id: doc.id, title }
            })
          })
      }
      return this.institutions.filter(i => i.title.toLowerCase().includes(str.toLowerCase()))
    }
  }
}
</script>
