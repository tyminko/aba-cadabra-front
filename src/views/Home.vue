<template>
  <div class="post-feed flex-col">
    <transition>
      <div v-if="!processing" class="site-caption text-xs leading-none text-aba-blue">
        Artists research and residency program Air Berlin Alexanderplatz
      </div>
    </transition>
    <transition>
      <a-b-a-logo v-if="processing" class="bg-logo block"/>
      Loading...
    </transition>
    <post-feed-grid
      :posts="posts"
      :processing="processing"
      class="flex-grow"/>
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
  @import "../styles/vars";
  @import "../styles/mixins";

  .site-caption {
    width: calc(100% - #{$base-size / 2});
    border-top: 1px solid $color-aba-blue;
    padding: $small-padding $small-padding $small-padding $base-size - $base-size / 4;
    margin-bottom: auto;
    opacity: 0.7;
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
  .bg-logo {
    position: fixed;
    @include centered;
    font-size: 70vw !important;
    color: $color-aba-blue-semi;
    z-index: -100;
    opacity: 0.1;
  }
</style>
