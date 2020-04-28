<template>
  <editor-popover
    ref="popover"
    :type="postType"
    :open="open"
    :processing="processing"
    @esc="onEsc"
    @close="$emit('close')"
    @save="save">
    <template v-slot:header>
      <h1 class="capitalize px-sm text-aba-blue truncate overflow-y-visible">
        <span :class="{'type-with-title': !!header}">{{postType}}</span>
        {{header}}
      </h1>
    </template>
    <component
      v-bind:is="component"
      ref="editor"
      :open="open"
      :value="value"
      @set-header="header = $event"
      @setProcessing="processing = $event"
      @close="$emit('close')"
      @saved="onSaved || $emit('close')"/>
    <div v-if="processing" class="progress-overlay absolute w-full h-full inset-0 flex items-center justify-center z-50 bg-milk">
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

export default {
  name: 'Editor',
  components: { Spinner, EditorPopover, EventEditor, PostEditor, ProfileEditor },
  props: {
    open: Boolean,
    value: { type: Object, default: null },
    type: String,
    onSaved: { type: Function, default: null }
  },
  data () {
    return {
      header: '',
      processing: false
    }
  },
  computed: {
    postType () {
      return (this.value || {}).type || this.type || 'post'
    },
    component () {
      switch (this.postType) {
        case 'event': return 'EventEditor'
        case 'profile': return 'ProfileEditor'
        default: return 'PostEditor'
      }
    },
    headerTitle () {
      return this.header || (this.$refs.editor || {}).headerTitle || ''
    }
  },
  methods: {
    onEsc () {},
    save () {
      if (typeof (this.$refs.editor || {}).save === 'function') {
        this.$refs.editor.save()
      }
    }
    // onSaved (payload) {
    //   this.$emit('close')
    //   if (payload && typeof this.onSaved === 'function') {
    //     this.onSaved(payload)
    //   }
    // }
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
