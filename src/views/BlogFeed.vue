<template>
  <div class="blog-feed flex justify-center">
    <div class="feed w-full max-w-text">
      <h1 class="">Blog by {{authorName}}</h1>
      <blog-article
        v-for="post in feed"
        :key="post.id"
        ref="posts"
        :post="post"
        :preload-attachments="false">
      </blog-article>
    </div>
    <div class="feed-sidebar">
      <blog-sidebar :author="author" />
    </div>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import BlogArticle from './components/BlogArticle'
import BlogSidebar from './BlogSidebar'

export default {
  name: 'BlogFeed',
  components: { BlogSidebar, BlogArticle },
  props: {},

  data: () => ({
    unsubscribeFirst: null,
    unsubscribe: null,
    feed: {},
    authorId: null
  }),

  computed: {
    author () {
      const firstPost = Object.values(this.feed || {})[0]
      if (!firstPost) return null
      return firstPost.author
    },
    authorName () {
      return (this.author || {}).displayName
    }
  },

  created () {
    // this.getFirstPost()
    this.subscribe()
  },

  watch: {
    $route () {
      // !!! DEBUG !!!
      console.log(`%c $route() %c this.unsubscribe: `, 'background:#ffbbff;color:#000', 'color:#00aaff', this.unsubscribe)
      this.onPostsLoaded()
    }
  },

  methods: {
    async onPostsLoaded () {
      await this.$nextTick()
      const postId = this.$route.params.postId
      console.log(`%c onPostsLoaded() %c this.$refs.posts: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.$refs.posts)
      const box = this.$refs.posts.find(p => p.post.id === postId)
      if (!box) return
      // !!! DEBUG !!!
      console.log(`%c onPostsLoaded() %c box: `, 'background:#ffbb00;color:#000', 'color:#00aaff', box)
      // !!! DEBUG !!!
      console.log(`%c onPostsLoaded() %c postId: `, 'background:#ffbb00;color:#000', 'color:#00aaff', postId)
      const focusBox = box.$el // document.getElementById(postId)
      // !!! DEBUG !!!
      console.log(`%c onPostsLoaded() %c focusBox: `, 'background:#ffbb00;color:#000', 'color:#00aaff', focusBox)
      if (focusBox) {
        focusBox.scrollIntoView(true)
      }
    },
    getFirstPost () {
      const postId = this.$route.params.postId
      if (postId) {
        db.collection('posts')
          .doc(postId)
          .get()
          .then(doc => {
            this.$set(this.feed, doc.id, { ...doc.data(), id: doc.id })
          })
          .catch(err => {
            console.error('Blog subscribe:', err)
          })
      }
    },
    subscribe () {
      const authorId = this.$route.params.authorId
      // !!! DEBUG !!!
      console.log(`%c subscribe() %c authorId: `, 'background:#ff00aa;color:#000', 'color:#00aaff', authorId)
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
              // !!! DEBUG !!!
              console.log(`%c next() %c Object.keys(this.feed): `, 'background:#ffbb00;color:#000', 'color:#00aaff', Object.keys(this.feed))
              this.onPostsLoaded()
            },
            error: err => {
              console.error('Blog subscribe:', err)
            }
          })
      }
    }
  },
  beforeDestroy () {
    // !!! DEBUG !!!
    console.log(`%c beforeDestroy() %c this.unsubscribe: `, 'background:#ff0000;color:#000', 'color:#00aaff', this.unsubscribe)
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe()
    }
    if (typeof this.unsubscribeFirst === 'function') {
      this.unsubscribeFirst()
    }
  }
}
</script>

<style lang="scss">
  .blog-feed {

  }
</style>
