<template>
  <article class="blog-article py-xl border-b">
    <div class="mb-base text-block">{{formattedDate}} {{post.id}}</div>
    <h2 class="mb-base text-block">{{post.title}}</h2>
    <div class="gallery flex flex-wrap">
      <div
        v-for="item in attachments"
        :key="item.id"
        class="attachment mb-sm">
        <div class="attachment-box relative">
          <img
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
    <div v-if="content" v-html="content" class="text-block mt-base w-text"/>
  </article>
</template>

<script>
import * as date from '../../lib/date'
import DOMPurify from 'dompurify'

export default {
  name: 'BlogArticle',
  props: {
    post: { type: Object, required: true },
    preloadAttachments: Boolean
  },

  data: () => ({}),

  computed: {
    formattedDate () {
      return date.format(this.post.date, 'long', 'de')
    },
    attachments () {
      const count = Object.keys(this.post.attachments || {}).length
      if (!count) return []
      return Object.entries(this.post.attachments).reduce((res, [id, item]) => {
        const { preview, full, original } = item.srcSet
        const src = full || preview || original
        res.push({ id, type: item.type, url: src.url, dimensions: src.dimensions, caption: item.caption })
        return res
      }, [])
    },

    content () {
      if ((this.post || {}).content) {
        return DOMPurify.sanitize(this.post.content)
      }
      return ''
    }
  },

  mounted () {

  },

  methods: {}
}
</script>

<!--suppress CssInvalidFunction -->
<style lang="css">
  .blog-article .attachment-box img {
    max-height: calc(100vh - theme('spacing.base') * 2);
    /*max-width: calc(100vh - theme('spacing.base') * 2);*/
    width: auto;
  }
</style>
<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .blog-article {
    overflow-wrap: break-word;
    word-wrap: break-word;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;

    & > *:not(.gallery) {
      /*@apply px-sm;*/
    }
    .attachment-box{
      /*@apply mx-sm;*/
    }
  }
</style>
