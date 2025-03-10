<template>
  <div class="caption-editor flex items-end text-sm"
       :class="{caption: caption||startEditing, editing: startEditing}">
    <expandable-text
      ref="caption"
      v-if="caption||startEditing"
      :force-expand="startEditing"
      :class="{editing:startEditing}"
      class="pl-sm py-sm">
      <span
        ref="caption-text"
        :contenteditable="startEditing"
        class="caption-text leading-tight text-sm inline-block min-w-full"
        @keydown.enter="finishCaptionEditing"
        @keydown.esc="onEsc">
        {{caption||''}}
      </span>
    </expandable-text>
    <button
      class="h-3/4base ml-auto"
      :class="{'w-3/4base':caption||startEditing}"
      @click.prevent="toggleCaptionEditor">
      <i v-if="caption&&!startEditing" class="material-icons text-sm">edit</i>
      <i v-else-if ="startEditing" class="material-icons text-sm">done</i>
      <span v-else class="text-xs">Add Caption</span>
    </button>
  </div>
</template>

<script>
import ExpandableText from 'vue-expandable-text-line'

export default {
  name: 'CaptionEditor',
  components: { ExpandableText },
  props: {
    value: String
  },

  data: () => ({
    startEditing: false,
    text: ''
  }),

  computed: {
    caption: {
      get () { return this.text || this.value },
      set(newValue) {
        this.text = newValue
        this.$emit('input', newValue)
      }
    }
  },

  methods: {
    toggleCaptionEditor () {
      if (this.startEditing) {
        this.finishCaptionEditing ()
      } else {
        this.openEditor ()
      }
    },

    async openEditor () {
      this.startEditing = true
      if (typeof this.value === 'undefined') {
        this.$emit('add-caption')
      }
      await this.$nextTick ()
      this.$refs.caption.expand ()
      this.$refs['caption-text'].focus ()
    },

    async closeEditor () {
      this.startEditing = false
      await this.$nextTick ()
      if (this.$refs.caption) {
        this.$refs.caption.collapse ()
      }
    },

    finishCaptionEditing () {
      this.caption = this.$refs['caption-text'].textContent.trim ()
      this.closeEditor ()
    },

    onEsc(e) {
      e.target.textContent = this.caption
      e.stopImmediatePropagation ()
      this.closeEditor ()
    }
  }
}
</script>

<!--suppress CssInvalidFunction -->
<style lang="css" scoped>
  .attachment-editor-cell .expandable-text-line {
    max-height: calc(256px - theme('spacing.3/4base'));
    hyphens: auto;
  }
  /*.attachment-editor-cell .expandable-text-line.editing{*/
  /*  height: auto !important;*/
  /*}*/
</style>
<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .caption-editor {
    width: auto;
    &.caption {
      width: 100%;
    }

    &.editing:after {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(255,255,255,0.6);
      z-index: -1;
      @apply border-b border-aba-blue;
    }

    .caption-text[contenteditable="true"] {
      /*box-shadow: 0 0 0 5px rgba(255,255,255,0.4);*/
      /*border-radius: 1px;*/
      /*z-index: 100;*/

      &:focus {
        outline: none;
        @apply text-aba-blue;
      }
    }
  }
</style>
