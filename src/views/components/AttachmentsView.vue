<template>
  <div class="attachments-view">
    <div
      v-for="item in attachmentsList"
      :key="item.id"
      class="attachment mt-base mb-sm">
      <div class="attachment-box relative">
        <VimeoPlayer
          v-if="item.type === 'embed/vimeo'"
          :value="item" />
        <div
          v-else-if ="item.type === 'embed/mixcloud'"
          v-html="item.html"
          class="mixcloud-embed"/>
        <img
          v-else
          :src="item.url"
          :alt="item.caption"
          :width="item.dimensions?.w"
          :height="item.dimensions?.h"
          class="bg-gray-400"
          :class="{'outline': item.type === 'application/pdf'}"
          loading="lazy"/>
        <a
          v-if="item.type === 'application/pdf'"
          class="button compact absolute top-0 right-0 mt-sm mr-sm flex flex-col items-center justify-center hover:no-underline focus:no-underline bg-milk"
          :href="item.original.url"
          target="_blank"
          rel="noopener noreferrer"
          download>
          <i class="material-icons">get_app</i>
          <span class="text-xs">PDF</span>
        </a>
        <div
          v-if="item.caption"
          class="text-block text-sm">
          {{ item.caption }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VimeoPlayer from './VimeoPlayer.vue'

const props = defineProps({
  attachments: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// Computed
const attachmentsList = computed(() => {
  const count = Object.keys(props.attachments || {}).length
  if (!count) return []

  return Object.entries(props.attachments)
    .sort((a, b) => a.order - b.order)
    .reduce((res, [id, item]) => {
      const { preview, full, original } = item.srcSet
      let src

      if (item.type === 'embed/vimeo') {
        src = full
        res.push({
          id,
          type: item.type,
          vimeoId: item.name,
          url: src.url,
          dimensions: src.dimensions,
          caption: item.caption
        })
      } else if (item.type === 'embed/mixcloud') {
        src = full
        res.push({
          id,
          type: item.type,
          html: item.html,
          url: src.url,
          dimensions: src.dimensions,
          caption: item.caption
        })
      } else {
        src = full || (preview?.size > original.size ? preview : original)
        res.push({
          id,
          type: item.type,
          url: src.url,
          dimensions: src.dimensions,
          caption: item.caption,
          original
        })
      }
      return res
    }, [])
})
</script>

<style lang="scss" scoped>
.attachments-view {
  .outline {
    border: 1px solid #f2f2f2;
  }

  .mixcloud-embed {
    width: 100%;
    min-height: 120px;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}
</style>
