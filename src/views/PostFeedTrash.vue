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
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    posts () {
      return Object.values(this.feed).sort((a, b) => b.date - a.date)
    }
  },

  watch: {
    user () {
      if (!this.user) {
        this.$router.push({ name: 'home' })
        return
      }
      this.subscribeFeed()
    },
    $route () { if (this.user && !this.unsubscribe) this.subscribeFeed() }
  },

  async created () {
    if (this.user) this.subscribeFeed()
  },

  methods: {
    subscribeFeed () {
      this.unsubscribeFeed()
      const options = { status: 'trash' }
      if (!this.adminOrEditor) options.authorId = this.user.uid
      this.unsubscribe = subscribeToPosts(
        options,
        (id, post) => this.$set(this.feed, id, post),
        id => this.$delete(this.feed, id),
        () => { this.processing = false }
      )
    },

    unsubscribeFeed () {
      if (typeof this.unsubscribe === 'function') {
        this.unsubscribe()
        this.unsubscribe = null
        this.feed = {}
      }
    }
  },
  beforeDestroy () {
    this.unsubscribeFeed()
  }
}
</script>
