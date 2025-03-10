<template>
  <div class="post-feed flex-col">
    <transition name="fade">
      <div v-if="!processing" class="site-caption text-xs leading-none text-aba-blue">
        Artists research and residency program Air Berlin Alexanderplatz
      </div>
    </transition>
    <div v-if="processing" class="loading-container">
      <transition name="fade">
        <a-b-a-logo class="bg-logo block"/>
      </transition>
      <div>Loading...</div>
    </div>
    <post-feed-grid
      :posts="posts"
      :processing="processing"
      class="flex-grow"/>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useFeedSubscription } from '../composables/useFeedSubscription'
import PostFeedGrid from './components/PostFeedGrid'
import ABALogo from './components/ABALogo'

defineOptions({
  name: 'HomePage'
})

const logoBoxRef = ref(null)

const { feed, processing } = useFeedSubscription()

const posts = computed(() =>
  Object.values(feed.value).sort((a, b) => b.date - a.date)
)

watch(processing, (val) => {
  if (val) return
  setTimeout(() => {
    if (!logoBoxRef.value) return
    const top = logoBoxRef.value.getBoundingClientRect().bottom
    window.scrollTo({ top, behavior: 'smooth' })
  }, 500)
})
</script>

<style lang="scss" scoped>
  @import "../styles/vars";
  @import "../styles/mixins";

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

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
