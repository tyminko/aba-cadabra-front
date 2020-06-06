<template>
  <div class="attachments-view">
    <div v-for="item in attachments" :key="item.id" class="attachment mt-base mb-sm">
      <div class="attachment-box relative">
        <vimeo-player v-if="item.type === 'embed/vimeo'" :value="item" />
        <div v-else-if="item.type === 'embed/mixcloud'" v-html="item.html"/>
        <img
          v-else
          :src="item.url"
          :alt="item.caption"
          :width="(item.dimensions || {}).w"
          :height="(item.dimensions || {}).h"
          class="bg-gray-400"/>
        <div v-if="item.caption" class="text-block text-sm">
          {{item.caption}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VimeoPlayer from './VimeoPlayer'

export default {
  name: 'AttachmentsView',
  components: { VimeoPlayer },
  props: {
    attachments: { type: Object, required: true }
  },

  data: () => ({}),

  computed: {
    attachmentsList () {
      const count = Object.keys(this.attachments || {}).length
      if (!count) return []
      return Object.entries(this.attachments)
        .sort((a, b) => a.order - b.order)
        .reduce((res, [id, item]) => {
          const { preview, full, original } = item.srcSet
          let src
          if (item.type === 'embed/vimeo') {
            src = full
            res.push({ id, type: item.type, vimeoId: item.name, url: src.url, dimensions: src.dimensions, caption: item.caption })
          } else if (item.type === 'embed/mixcloud') {
            src = full
            res.push({ id, type: item.type, html: item.html, url: src.url, dimensions: src.dimensions, caption: item.caption })
          } else {
            src = full || (preview || {}).size > original.size ? preview : original
            res.push({ id, type: item.type, url: src.url, dimensions: src.dimensions, caption: item.caption })
          }
          return res
        }, [])
    }
  },

  methods: {}
}
</script>

<style lang="scss">
  .attachments-view {
  }
</style>
