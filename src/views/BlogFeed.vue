<template>
  <div class="blog-feed">
    <h1 class="px-base mb-base">Blog by {{authorName}}</h1>
    <blog-article
      v-for="post in feed"
      :key="post.id"
      :post="post"
      class="p-base">
    </blog-article>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import BlogArticle from './components/BlogArticle'

export default {
  name: 'BlogFeed',
  components: { BlogArticle },
  props: {},

  data: () => ({
    unsubscribe: null,
    feed: {}
  }),

  computed: {
    authorName () {
      const firstPost = Object.values(this.feed || {})[0]
      if (!firstPost) return ''
      return (firstPost.author || {}).displayName
    }
  },

  created () {
    this.subscribe()
  },

  methods: {
    subscribe () {
      const authorId = this.$route.params.authorId
      if (authorId) {
        this.unsubscribe = db.collection('posts')
          .where('author.uid', '==', authorId)
          .where('type', '==', 'post')
          .where('status', '==', 'public')
          .orderBy('date', 'desc')
          .onSnapshot({
            next: querySnapshot => {
              querySnapshot.docChanges().forEach(docChange => {
                const doc = docChange.doc
                switch (docChange.type) {
                  case 'added':
                  case 'modified':
                    this.$set(this.feed, doc.id, { ...doc.data(), id: doc.id })
                    break
                  case 'removed':
                    this.$delete(this.feed, doc.id)
                }
              })
            },
            error: err => {
              console.error('Blog subscribe:', err)
            }
          })
      }
    }
  },
  beforeDestroy () {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe()
    }
  }
}
</script>

<style lang="scss">
  .blog-feed {
  }
</style>
