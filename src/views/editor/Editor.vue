<template>
  <editor-popover
    ref="popover"
    :type="postType"
    :open="open"
    :buttons="editorButtons"
    :processing="processing"
    :valid="isValid"
    @esc="onEsc"
    @close="$emit('close')"
    @save="save"
    @remove="remove">
    <template v-slot:header>
      <h1
        class="capitalize px-sm truncate overflow-y-visible leading-normal"
        :class="readyToDelete ? 'text-gray-500': 'text-aba-blue'">
        <span :class="{'type-with-title': !!header}">{{postType}}</span>
        {{header}}
      </h1>
    </template>
    <component
      v-bind:is="component"
      ref="editor"
      :open="open"
      :value="value"
      @validated="isValid = $event"
      @set-header="header = $event"
      @setProcessing="processing = $event"
      @allowDelete="editorCanDelete = $event"
      @close="$emit('close')"
      @saved="afterSave"/>
    <template v-if="editorCanDelete" v-slot:footer>
      <div class="">
        <button @click.prevent="readyToDelete = !readyToDelete">
          <i class="material-icons text-gray-600">{{readyToDelete ? 'delete' : 'delete_outline'}}</i>
        </button>
      </div>
    </template>
    <div v-if="processing"
         class="progress-overlay absolute w-full h-full inset-0 flex items-center justify-center z-50 bg-milk">
      <div class="text-xl text-aba-blue">Saving...</div>
    </div>
  </editor-popover>
</template>

<script>
import EventEditor from './EventEditor'
import PostEditor from './PostEditor'
import ProfileEditor from './ProfileEditor'
import EditorPopover from './EditorPopover'
import Spinner from '../components/UI/Spinner'
import ProgrammeEditor from './ProgrammeEditor'
import PageEditor from './PageEditor'

export default {
  name: 'Editor',
  components: { Spinner, EditorPopover, EventEditor, PostEditor, ProfileEditor, ProgrammeEditor, PageEditor },
  props: {
    open: Boolean,
    value: { type: Object, default: null },
    type: String,
    onSaved: { type: Function, default: null }
  },
  data () {
    return {
      header: '',
      processing: false,
      editorCanDelete: false,
      isValid: true,
      readyToDelete: false
    }
  },
  computed: {
    postType () {
      return this.type || (this.value || {}).type || 'post'
    },
    component () {
      switch (this.postType) {
        case 'event': return 'EventEditor'
        case 'profile': return 'ProfileEditor'
        case 'programme': return 'ProgrammeEditor'
        case 'page': return 'PageEditor'
        default: return 'PostEditor'
      }
    },
    headerTitle () {
      return this.header || (this.$refs.editor || {}).headerTitle || ''
    },
    editorButtons () {
      const buttons = { close: 'Cancel' }
      if (this.readyToDelete) {
        buttons.delete = 'Trash It'
      } else {
        buttons.submit = 'Save'
      }
      return buttons
    }
  },
  methods: {
    onEsc () {},
    save () {
      if (typeof (this.$refs.editor || {}).save === 'function') {
        this.$refs.editor.save()
      }
    },
    afterSave (data) {
      if (typeof this.onSaved === 'function') {
        this.onSaved(data)
      } else {
        this.$emit('close')
      }
    },
    remove () {
      if (this.editorCanDelete) {
        this.$refs.editor.remove()
      }
    }
  }
}
</script>
<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .type-with-title {
    @apply text-gray-600 font-thin;
    &:after {
      content: ': '
    }
  }
</style>
