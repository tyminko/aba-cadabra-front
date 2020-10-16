<template>
  <div class="post-feed flex-col">
    <transition>
      <div v-if="!processing" class="site-caption text-xs leading-none text-gray-600">
        AIR Berlin Alexanderplatz, an artist-run initiative.
      </div>
    </transition>
    <post-feed-grid
      :posts="posts"
      :processing="processing"/>
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
  @import "../styles/vars";

  .site-caption {
    width: calc(100% - #{$base-size / 2});
    border-top: 1px solid $color-aba-blue;
    padding: $small-padding $small-padding $small-padding $base-size - $base-size / 4;
  }

  #app .a-b-a-logo.main {
    position: relative;
    left: 0;
    transition: font-size 0.5s 0.1s, left 0.5s 0.1s;
  }
  #app .logo-wrap {
    border-bottom: 1px solid $color-aba-blue;
    width: calc(100% - #{$base-size / 2});
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
