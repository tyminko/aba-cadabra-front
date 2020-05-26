<template>
  <div class="home">
    <post-feed-grid :posts="posts" :processing="processing" />
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import { mapState, mapActions } from 'vuex'
import PostFeedGrid from './components/PostFeedGrid'

export default {
  name: 'Home',
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
    user () { this.getFeed() }
  },

  async created () {
    if (this.user || this.user === null) { this.getFeed() }
  },

  methods: {
    ...mapActions(['showEditor']),

    getFeed () {
      this.processing = true
      let status = 'public'
      if (this.user) {
        if (['internal', 'draft', 'trash'].includes(this.$route.params.filter)) {
          status = this.$route.params.filter
        }
      }
      let query = db.collection('posts').where('status', '==', status)
      if (status !== 'public' && !this.adminOrEditor) {
        query = query.where('author.uid', '==', this.user.uid)
      }
      query = query.orderBy('date', 'desc')

      this.unsubscribe = query.onSnapshot({
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
          this.processing = false
        },
        error: err => {
          console.error('getFeed:', err)
          this.processing = false
        }
      })
    }
  },
  beforeDestroy () {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe()
    }
  }
}
</script>

<style lang='scss'>
  @import "../styles/vars";
  @import "../styles/mixins";
  .home {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - #{$base-size * 2});
  }
</style>
