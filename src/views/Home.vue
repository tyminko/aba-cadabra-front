<template>
  <div class="post-feed">
    <post-feed-grid :posts="posts" :processing="processing" />
  </div>
</template>

<script>
import FeedSubscription from '../mixins/feed-subscription'
import PostFeedGrid from './components/PostFeedGrid'

export default {
  name: 'Home',
  mixins: [FeedSubscription],
  components: { PostFeedGrid },

  data: () => ({
    feed: {},
    includeDrafts: false
  }),
  computed: {
    posts () {
      return Object.values(this.feed).sort((a, b) => b.date - a.date)
    }
  }

  // created () { this.setViewCanToggleDrafts(true) },
  // beforeDestroy () { this.setViewCanToggleDrafts(false) },

  // watch: {
  //   showDraftsInGrid () { this.includeDrafts = this.showDraftsInGrid }
  // },

  // methods: {
  //   ...mapActions(['setViewCanToggleDrafts'])
  // }
}
</script>
