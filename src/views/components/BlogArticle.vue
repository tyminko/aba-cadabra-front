<template>
  <article class="blog-article post-cell py-xl">
    <div class="mb-base text-block">{{formattedDate}}</div>
    <h2 class="mb-base text-block">{{post.title}}</h2>
    <div class="gallery flex flex-wrap">
      <attachments-view :attachments="attachments"/>
    </div>
    <div v-if="content" v-html="content" class="text-block mt-base w-text"/>
  </article>
</template>

<script>
import * as date from '../../lib/date'
import DOMPurify from 'dompurify'
import AttachmentsView from './AttachmentsView'

export default {
  name: 'BlogArticle',
  components: { AttachmentsView },
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
      return (this.post || {}).attachments || {}
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
