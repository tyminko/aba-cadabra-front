<template>
  <content-with-sidebar>
    <template v-slot:main>
      <h1 class="text-block">Blog by {{authorName}}</h1>
      <blog-article
        v-for="post in posts"
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
import { mapState } from 'vuex'
import { db } from '../lib/firebase'
import FeedSubscription from '../mixins/feed-subscription'
import BlogArticle from './components/BlogArticle'
import BlogSidebar from './BlogSidebar'
import ContentWithSidebar from './components/UI/layouts/ContentWithSidebar'

export default {
  name: 'BlogFeed',
  mixins: [FeedSubscription],
  components: { ContentWithSidebar, BlogSidebar, BlogArticle },
  props: {
    value: { type: Object, default: null }
  },

  data: () => ({
    unsubscribeFirst: null,
    subscriptionPostType: 'post',
    feed: {},
    IntersectionObserver: null,
    activePostId: null
  }),

  computed: {
    ...mapState(['user']),

    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },

    authorId () { return this.$route.params.authorId },

    posts () {
      return Object.values(this.feed).sort((a, b) => b.date - a.date)
    },

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
    this.setViewCanToggleDrafts(!!this.user)
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.5, 1]
    }
    this.IntersectionObserver = new IntersectionObserver(entries => {
      const biggest = entries.filter(entry => {
        return entry.intersectionRatio >= 0.5
      }).sort((a, b) => a.intersectionRatio - b.intersectionRatio)
      this.activePostId = ((biggest[0] || {}).target || {}).id || null
    }, options)
  },

  watch: {
    feed () {
      this.onPostsLoaded()
    }
  },

  beforeDestroy () { this.setViewCanToggleDrafts(false) },

  methods: {
    async onPostsLoaded () {
      await this.$nextTick()
      if (this.IntersectionObserver) this.IntersectionObserver.disconnect()
      ;(this.$refs.posts || []).forEach(p => {
        this.IntersectionObserver.observe(p.$el)
      })
      const postId = this.$route.params.postId
      const box = this.$refs.posts.find(p => p.post.id === postId)
      if (!box) return
      const focusBox = box.$el // document.getElementById(postId)
      if (focusBox) {
        this.activePostId = postId
        focusBox.scrollIntoView(true)
      }
    },
    scrollToNext () {
      if (this.nextPostIndex !== null) {
        const box = this.$refs.posts[this.nextPostIndex]
        if ((box || {}).$el) {
          this.activePostId = box.post.id
          box.$el.scrollIntoView({ behavior: 'smooth' })
        }
      }
    },
    scrollToPrevious () {
      if (this.previousPostIndex !== null) {
        const box = this.$refs.posts[this.previousPostIndex]
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
    }
  }
}
</script>

<style lang="scss">
</style>
