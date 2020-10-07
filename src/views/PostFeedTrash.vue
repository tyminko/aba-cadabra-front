<template>
  <div class="post-feed flex-col">
      <button v-if="Object.keys(feed).length" class="self-end" @click="emptyTrash">Empty Trash</button>
      <post-feed-grid :posts="posts" :processing="processing" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { subscribeToPosts } from '../lib/posts-feed'
import { db } from '../lib/firebase'
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
    },

    emptyTrash () {
      db.collection('posts')
        .where('status', '==', 'trash')
        .get()
        .then(snap => {
          snap.forEach(doc => doc.ref.delete())
        })
    }
  },
  beforeDestroy () {
    this.unsubscribeFeed()
  }
}
</script>
