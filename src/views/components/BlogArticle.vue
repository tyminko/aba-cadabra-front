<template>
  <article class="blog-article py-xl border-b">
    <div>{{formattedDate}}</div>
    <h2>{{post.title}}</h2>
    <div class="gallery">
      <div
        v-for="item in attachments"
        :key="item.id"
        class="attachment mb-sm">
        <img :src="item.url" :alt="item.caption"/>
        <div v-if="item.caption" class="text-sm">
          {{item.caption}}
        </div>
      </div>
    </div>
    <div v-if="content" v-html="content" />
  </article>
</template>

<script>
import * as date from '../../lib/date'
import DOMPurify from 'dompurify'

export default {
  name: 'BlogArticle',
  props: {
    post: { type: Object, required: true }
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
        res.push({ id, type: item.type, url: (full || preview || original).url, caption: item.caption })
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

  methods: {}
}
</script>

<style lang="scss">
  .blog-article {
  }
</style>
