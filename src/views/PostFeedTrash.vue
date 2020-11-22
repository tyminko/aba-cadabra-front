<template>
  <div class="post-feed flex-col">
      <button v-if="Object.keys(feed).length" class="self-end" @click="emptyTrash">Empty Trash</button>
      <post-feed-grid :posts="posts" :processing="processing" without-quick-edit/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { subscribeToPosts } from '../lib/posts-feed'
import { db } from '../lib/firebase'
import PostFeedGrid from './components/PostFeedGrid'

export default {
  name: 'PostFeedTrash',
  components: { PostFeedGrid },
  props: {},

  data: () => ({
    feed: {
      posts: {},
      pages: {},
      institutions: {}
    },
    unsubscribe: {},
    processing: true,
    types: ['posts', 'pages', 'institutions']
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    posts () {
      return Object.values(this.feed)
        .reduce((res, feed) => [...res, ...Object.values(feed)], [])
        .sort((a, b) => b.date - a.date)
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
  destroyed () {
    this.unsubscribeFeed()
  },

  methods: {
    subscribeFeed () {
      this.unsubscribeFeed()
      const options = { status: 'trash' }
      if (!this.adminOrEditor) options.authorId = (this.user || {}).uid
      this.types.forEach(collectionName => {
        this.unsubscribe[collectionName] = subscribeToPosts(
          { ...options, collectionName },
          (id, post) => {
            this.$set(this.feed[collectionName], id, collectionName === 'posts' ? post : {
              ...post,
              type: this.collectionNameToType(collectionName)
            })
          },
          id => this.$delete(this.feed[collectionName], id),
          () => { this.processing = false }
        )
      })
    },

    unsubscribeFeed () {
      Object.entries(this.unsubscribe).forEach(([unsub, type]) => {
        if (typeof unsub === 'function') {
          unsub()
          this.unsubscribe[type] = null
          this.feed[type] = {}
        }
      })
    },

    emptyTrash () {
      this.types.forEach(collName => {
        db.collection(collName)
          .where('status', '==', 'trash')
          .get()
          .then(snap => {
            snap.forEach(doc => doc.ref.delete())
          })
      })
    },

    collectionNameToType (collectionName) {
      switch (collectionName) {
        case 'institutions': return 'partner'
        case 'pages': return 'page'
      }
    }
  },
  beforeDestroy () {
    this.unsubscribeFeed()
  }
}
</script>
