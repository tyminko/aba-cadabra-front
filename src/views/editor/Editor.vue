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
      <h1 class="capitalize px-sm text-aba-blue">
        <span :class="{'type-with-title': !!header}">{{postType}}</span>
        {{header}}
      </h1>
    </template>
    <component
      v-bind:is="component"
      ref="editor"
      :open="open"
      :value="value"
      @set-header="header = $event"/>
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

<script>
import EventEditor from './EventEditor'
import PostEditor from './PostEditor'
import EditorPopover from './EditorPopover'

export default {
  name: 'Editor',
  components: { EditorPopover, EventEditor, PostEditor },
  props: {
    open: Boolean,
    value: { type: Object, default: null },
    type: String
  },
  data () {
    return {
      processing: false,
      header: ''
    }
  },
  computed: {
    postType () {
      return (this.value || {}).type || this.type || 'post'
    },
    component () {
      return this.postType === 'event' ? 'EventEditor' : 'PostEditor'
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
