<template>
  <div class="post-feed">
    <post-feed-grid :posts="posts" :processing="processing" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { subscribeToPosts } from '../lib/posts-feed'
import PostFeedGrid from './components/PostFeedGrid'

export default {
  name: 'PostFeedInternal',
  components: { PostFeedGrid },
  props: {},

  data: () => ({
    feed: {},
    unsubscribe: null,
    processing: true
  }),

  computed: {
    ...mapState(['user']),
    posts () {
      return Object.values(this.feed).sort((a, b) => b.date - a.date)
    },
    // eslint-disable-next-line func-call-spacing
    isAdmin () { return this.user && this.user.role === 'admin' },
    // eslint-disable-next-line func-call-spacing
    isEditor () { return this.user && this.user.role === 'editor' },
    // eslint-disable-next-line func-call-spacing
    isAuthor () { return this.user && this.user.role === 'author' },
    // eslint-disable-next-line func-call-spacing
    isAdminOrEditor () { return this.isAdmin || this.isEditor },
    // eslint-disable-next-line func-call-spacing
    isAdminOrEditorOrAuthor () { return this.isAdminOrEditor || this.isAuthor }
  },

  watch: {
    // eslint-disable-next-line func-call-spacing
    user () {
      if (!this.user) {
        this.$router.push({ name: 'home' })
        return
      }
      this.subscribeFeed()
    },
    // eslint-disable-next-line func-call-spacing
    $route () { if (this.user && !this.unsubscribe) this.subscribeFeed() }
  },

  // eslint-disable-next-line func-call-spacing
  async created () {
    if (this.user) this.subscribeFeed()
  },

  methods: {
    // eslint-disable-next-line func-call-spacing
    subscribeFeed () {
      this.unsubscribeFeed()
      this.unsubscribe = subscribeToPosts(
        { status: 'internal' },
        (id, post) => this.$set(this.feed, id, post),
        id => this.$delete(this.feed, id),
        () => { this.processing = false }
      )
    },

    // eslint-disable-next-line func-call-spacing
    unsubscribeFeed () {
      if (typeof this.unsubscribe === 'function') {
        this.unsubscribe()
        this.unsubscribe = null
        this.feed = {}
      }
    }
  },
  // eslint-disable-next-line func-call-spacing
  beforeUnmount () {
    this.unsubscribeFeed()
  }
}
</script>
