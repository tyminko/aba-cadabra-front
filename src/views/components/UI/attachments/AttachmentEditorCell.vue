<template>
  <div class="attachment-editor-cell"
       :class="{err:item.err}">
    <img-with-overlay
      ref="attachments"
      :src="attachmentPreviewUrl"
      :key="`i${item.id}`"
      :o-blur="12"
      :object-fit="cropPreview ? 'cover' : 'contain'"
      object-position="center"
      class="w-full h-full border-transparent border"
      @load="onImageLoad">
      <div class="left-buttons absolute flex items-center h-2/3base top-0 left-0">
        <button
          class="crop-toggle w-2/3base h-2/3base"
          @click.prevent="setPoster">
          <i class="material-icons" :class="isPoster ? 'text-xxl text-aba-blue' : 'text-base'">{{isPoster ? 'bookmark' : 'bookmark_border'}}</i>
        </button>
        <span v-if="isPoster" class="text-xs italic">Poster</span>
        <button
          class="crop-toggle w-2/3base h-2/3base"
          @click.prevent="cropPreview = !cropPreview">
          <i class="material-icons text-sm">{{cropPreview ? 'crop_free' : 'crop'}}</i>
        </button>
      </div>
      <div class="status-bar absolute absolute top-0 right-0 flex items-center">
        <div
          v-if="item.progress && item.progress < 100"
          class="progress-bar relative w-x2 h-3/4base flex items-center justify-center">
          <div class="absolute h-full left-0 top-0 bg-aba-blue" :style="{width:`${item.progress}%`}"/>
          <span v-if="item.progress===1" class="text-aba-blue text-xs">Resizing...</span>
        </div>
        <div v-else-if="item.file" class="pl-base text-aba-blue text-xs italic">New</div>
        <button
          :key="`b${item.id}`"
          class="remove w-3/4base h3/4base flex-shrink-0"
          @click.prevent="$emit('remove', item.id)">
          <i class="material-icons text-base">close</i>
        </button>
      </div>
        <caption-editor
          v-model="item.caption"
          class="absolute bottom-0 right-0"
          @add-caption="addCaption"/>
    </img-with-overlay>
  </div>
</template>

<script>
import ImgWithOverlay from '../ImgTransOverlay'
import CaptionEditor from './CaptionEditor'

export default {
  name: 'AttachmentEditorCell',
  components: { ImgWithOverlay, CaptionEditor },
  props: {
    value: { type: Object, required: true },
    isPoster: Boolean
  },

  data: () => ({
    cropPreview: true
  }),

  computed: {
    item () { return this.value },
    attachmentPreviewUrl () {
      const attachment = this.item
      if (attachment.srcSet) {
        if (attachment.srcSet.preview) return attachment.srcSet.preview.url
        if (attachment.srcSet.full) return attachment.srcSet.full.url
        if (attachment.srcSet.original && this.isVisual) {
          return attachment.srcSet.original.url
        } else {
          return ''
        }
      }
      if (attachment.image) {
        return attachment.image.src
      }
      if (attachment.file) {
        return URL.createObjectURL(attachment.file)
      }
      return ''
    },

    isVisual () {
      return this.item.type &&
        (this.item.type.startsWith('image') || this.item.type.startsWith('video'))
    }
  },

  mounted () {
    // window.addEventListener('keydown', this.onEsc)
    // addEventListener('keypress', (e) => {
    //   if ()
    // })
  },

  methods: {
    onImageLoad (event) {
      if (this.item.file) {
        URL.revokeObjectURL(event.target.src)
        this.setRawAttachmentImage(event)
      }
    },
    async setRawAttachmentImage (event) {
      if (this.isVisual && event.target instanceof HTMLImageElement) {
        this.item.image = await event.target.cloneNode()
        // !!! DEBUG !!!
        console.log(`%c setRawAttachmentImage() %c this.item.image: `, 'background:#ffccaa;color:#000', 'color:#00aaff', this.item.image)
      }
    },
    addCaption () {
      this.item.caption = ' '
    },
    setPoster () {
      this.$emit('set-poster', this.item.id)
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .attachment-editor-cell {
    position: relative;
  }
</style>
