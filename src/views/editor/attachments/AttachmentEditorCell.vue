<template>
  <div ref="box"
       class="attachment-editor-cell border-white border"
       :class="{err:item.err}">
    <vimeo-player
      v-if="item.type==='embed/vimeo'"
      v-show="playVideo"
      class="video-player"
      :style="videoDimensionsStyle"
      :options="{
        background:true,
        autoplay:true,
        loop:true,
        byline:false,
        portrait:false,
        title:false,
        fullscreen:false}"
      :video-id="item.name"/>
    <img-with-overlay
      ref="attachments"
      :src="attachmentPreviewUrl"
      :key="`i${item.id}`"
      :o-blur="12"
      :object-fit="doCrop ? 'cover' : 'scale-down'"
      object-position="center"
      class="w-full h-full"
      @load="onImageLoad">
      <div
        v-if="item.type==='embed/mixcloud'"
        class="audio-player absolute w-full z-50"
        v-html="item.html" />
      <div class="left-buttons absolute flex items-center h-3/4base top-0 left-0">
        <button
          v-if="!noPoster"
          class="crop-toggle w-2/3base h-2/3base"
          @click.prevent="setPoster">
          <i class="material-icons" :class="isPoster ? 'text-xxl text-aba-blue' : 'text-base'">{{isPoster ? 'bookmark' : 'bookmark_border'}}</i>
        </button>
        <span v-if="!noPoster && isPoster" class="text-xs italic">Poster</span>
        <button
          v-if="!noCrop"
          class="crop-toggle w-2/3base h-2/3base"
          @click.prevent="cropPreview = !cropPreview">
          <i class="material-icons text-sm">{{cropPreview ? 'crop_free' : 'crop'}}</i>
        </button>
        <button
          v-if="item.type==='embed/vimeo'"
          class="crop-toggle w-2/3base h-2/3base"
          @click.prevent="toggleVideoPlay">
          <i class="material-icons">{{playVideo ? 'pause' : 'play_arrow'}}</i>
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
          v-if="!noCaption"
          v-model="item.caption"
          class="absolute bottom-0 right-0"
          @add-caption="addCaption"/>
    </img-with-overlay>
  </div>
</template>

<script>
import ImgWithOverlay from '../../components/UI/ImgTransOverlay'
import CaptionEditor from './CaptionEditor'
import { vueVimeoPlayer as VimeoPlayer } from 'vue-vimeo-player'

export default {
  name: 'AttachmentEditorCell',
  components: { ImgWithOverlay, CaptionEditor, VimeoPlayer },
  props: {
    value: { type: Object, required: true },
    isPoster: Boolean,
    noCaption: Boolean,
    noPoster: Boolean,
    noCrop: Boolean
  },

  data: () => ({
    cropPreview: true,
    playVideo: false
  }),

  computed: {
    item () { return this.value },
    doCrop () { return this.noCrop ? false : this.cropPreview },
    attachmentPreviewUrl () {
      if (this.playVideo) return ''
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
        (this.item.type.startsWith('image') || this.item.type.startsWith('video') || this.item.type.startsWith('embed/vimeo'))
    },

    videoDimensionsStyle () {
      if (!this.playVideo) return null
      if (!this.$refs.box) return null
      if (this.item.type !== 'embed/vimeo') return null
      if (!this.cropPreview) {
        return { width: '100%', height: '100%' }
      }
      if (((this.item.srcSet || {}).original || {}).dimensions) {
        const dim = this.item.srcSet.original.dimensions
        let { width, height } = this.$refs.box.getBoundingClientRect()
        const attachRatio = dim.w / dim.h
        const boxRatio = width / height
        if (attachRatio > boxRatio) {
          height = '100%'
          width = dim.w / width * 100 + '%'
        } else {
          width = '100%'
          height = dim.h / height * 100 + '%'
        }
        return { width, height }
      }
      return null
    }
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
        this.item.image = await event.target
      }
    },

    addCaption () {
      this.item.caption = ' '
    },

    setPoster () {
      this.$emit('set-poster', this.item.id)
    },

    toggleVideoPlay () {
      this.playVideo = !this.playVideo
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .attachment-editor-cell {
    position: relative;
    overflow: hidden;
    &.framed {
      border-color: #e7e7e7 !important;
    }
    .video-player {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      iframe {
        position: absolute;
        width: 100%;
        height: 100%;
      }

    }
  }
</style>
