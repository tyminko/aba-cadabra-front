<template>
  <div ref="box" class="vimeo-player relative">
    <vue-vimeo-player
      ref="player"
      class="video-player"
      :style="videoDimensionsStyle"
      :options="{
        background:false,
        autoplay:false,
        loop:true,
        byline:false,
        portrait:false,
        title:false,
        fullscreen:false}"
      :videoId="value.vimeoId"/>
<!--    <div class="absolute inset-0" @click="togglePlay"></div>-->
  </div>
</template>

<script>
import { vueVimeoPlayer } from 'vue-vimeo-player'
export default {
  name: 'VimeoPlayer',
  components: { vueVimeoPlayer },
  props: { value: { type: Object, required: true } },

  data: () => ({
  }),

  computed: {
    videoDimensionsStyle () {
      if (!this.play) return null
      if (!this.$refs.box) return null
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
    async togglePlay () {
      const playerRef = this.$refs.player
      if (!playerRef) return
      const paused = await playerRef.player.getPaused()
      if (paused) {
        playerRef.player.play()
      } else {
        playerRef.player.pause()
      }
    }
  }
}
</script>

<style lang="scss">
  .vimeo-player {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 56.25%;
    iframe {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
</style>
