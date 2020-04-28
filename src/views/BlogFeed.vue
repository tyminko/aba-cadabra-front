<template>
  <content-with-sidebar>
    <template v-slot:main>
      <h1 class="text-block">Blog by {{authorName}}</h1>
      <blog-article
        v-for="post in feed"
        :key="post.id"
        :id="post.id"
        ref="posts"
        :post="post"
        :preload-attachments="false">
      </blog-article>
      <div class="nav sticky bottom-0 w-full flex justify-center">
        <button class="large bg-milk" @click="scrollToPrevious"><i class="material-icons">arrow_upward</i></button>
        <button class="large bg-milk" @click="scrollToNext"><i class="material-icons">arrow_downward</i></button>
      </div>
    </template>
    <template v-slot:sidebar>
      <blog-sidebar :author="author" :post="activePost"/>
    </template>
  </content-with-sidebar>
</template>

<script>
import { db } from '../lib/firebase'
import BlogArticle from './components/BlogArticle'
import BlogSidebar from './BlogSidebar'
import ContentWithSidebar from './components/UI/layouts/ContentWithSidebar'

export default {
  name: 'BlogFeed',
  components: { ContentWithSidebar, BlogSidebar, BlogArticle },
  props: {},

  data: () => ({
    unsubscribeFirst: null,
    unsubscribe: null,
    feed: {},
    IntersectionObserver: null,
    authorId: null,
    activePostId: null
  }),

  computed: {
    author () {
      const firstPost = Object.values(this.feed || {})[0]
      if (!firstPost) return null
      return firstPost.author
    },
    authorName () {
      return (this.author || {}).displayName
    },
    activePostIndex () {
      if (this.activePostId) {
        return this.$refs.posts.findIndex(p => p.post.id === this.activePostId)
      }
      return null
    },
    activePost () {
      return this.activePostId ? (this.feed || {})[this.activePostId] : null
    },
    previousPostIndex () {
      if (this.activePostIndex !== null) {
        return this.activePostIndex > 0 ? this.activePostIndex - 1 : null
      }
      return null
    },
    nextPostIndex () {
      if (this.activePostIndex !== null) {
        return this.activePostIndex < this.$refs.posts.length - 1
          ? this.activePostIndex + 1
          : null
      }
      return null
    }
  },

  created () {
    // this.getFirstPost()
    this.subscribe()

    let options = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.5, 1]
    }
    this.IntersectionObserver = new IntersectionObserver(entries => {
      const biggest = entries.filter(entry => {
        return entry.intersectionRatio >= 0.5
      })
        .sort((a, b) => a.intersectionRatio - b.intersectionRatio)
      //   // !!! DEBUG !!!
      // console.log(`%c () %c ((biggest[0] || {}).target || {}).id: `, 'background:#ffbbFF;color:#000', 'color:#00aaff', ((biggest[0] || {}).target || {}).id)
      this.activePostId = ((biggest[0] || {}).target || {}).id || null
    }, options)
  },

  watch: {
    $route () {
      this.onPostsLoaded()
    }
  },

  methods: {
    async onPostsLoaded () {
      await this.$nextTick()
      // !!! DEBUG !!!
      console.log(`%c onPostsLoaded() %c this.$refs.posts: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.$refs.posts)
      this.IntersectionObserver.disconnect()
      this.$refs.posts.forEach(p => {
        this.IntersectionObserver.observe(p.$el)
      })
      const postId = this.$route.params.postId
      const box = this.$refs.posts.find(p => p.post.id === postId)
      if (!box) return
      const focusBox = box.$el // document.getElementById(postId)
      // !!! DEBUG !!!
      console.log(`%c onPostsLoaded() %c focusBox: `, 'background:#ffbb00;color:#000', 'color:#00aaff', focusBox)
      if (focusBox) {
        this.activePostId = postId
        // !!! DEBUG !!!
        console.log(`%c onPostsLoaded() %c this.activePostId: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.activePostId)
        focusBox.scrollIntoView(true)
      }
    },
    scrollToNext () {
      if (this.nextPostIndex !== null) {
        const box = this.$refs.posts[this.nextPostIndex]
        // !!! DEBUG !!!
        console.log(`%c scrollToNext() %c box: `, 'background:#ffbb00;color:#000', 'color:#00aaff', box)
        if ((box || {}).$el) {
          this.activePostId = box.post.id
          box.$el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    },
    scrollToPrevious () {
      if (this.previousPostIndex !== null) {
        const box = this.$refs.posts[this.previousPostIndex]
        // !!! DEBUG !!!
        console.log(`%c scrollToPrevious() %c box: `, 'background:#ffbb00;color:#000', 'color:#00aaff', box)
        if ((box || {}).$el) {
          this.activePostId = box.post.id
          box.$el.scrollIntoView({ behavior: 'smooth' })
        }
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
</style>
