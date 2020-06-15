<template>
  <div class="post-feed flex-col">
    <div class="flex-col items-center">
      <a-b-a-logo class="main block"/>
      <h2 class="text-center mb-base text-gray-600">AIR Berlin Alexanderplatz, an artist-run initiative.</h2>
    </div>
    <post-feed-grid
      :posts="posts"
      :processing="processing"
      class="mt-xxl"/>
  </div>
</template>

<script>
import FeedSubscription from '../mixins/feed-subscription'
import PostFeedGrid from './components/PostFeedGrid'
import ABALogo from './components/ABALogo'

export default {
  name: 'Home',
  mixins: [FeedSubscription],
  components: { ABALogo, PostFeedGrid },

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
