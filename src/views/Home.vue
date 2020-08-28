<template>
  <div class="post-feed flex-col">
    <div ref="logo-box" class="logo-wrap" :class="{big: processing}">
      <a-b-a-logo class="main block" :class="{big: processing}"/>
      <h2 class="text-center mb-base text-gray-600 px-base">
        AIR Berlin Alexanderplatz, an artist-run initiative.
      </h2>
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
  },
  watch: {
    processing (val) {
      if (val) return
      setTimeout(() => {
        if (!this.$refs['logo-box']) return
        const top = this.$refs['logo-box'].getBoundingClientRect().bottom
        window.scrollTo({ top, behavior: 'smooth' })
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
  #app .a-b-a-logo.main {
    position: relative;
    left: 0;
    transition: font-size 0.5s 0.1s, left 0.5s 0.1s;
  }
  #app .logo-wrap {
    &.big {
      height: calc(50vw + 48px);
    }
    .a-b-a-logo.main.big {
      font-size: 50vw;
      left: -2vw;
      line-height: 0.8;
      transition: font-size 0.5s 0.5s, left 0.5s 0.5s;
    }
  }
</style>
