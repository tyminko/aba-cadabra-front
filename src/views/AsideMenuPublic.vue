<template>
  <div class="aside-menu">
    <div
      v-for="(item, id) in publicMenuItems"
      :key="id"
      class="menu-item flex items-center text-lg h-base bg-white pr-base">
      <router-link
        :to="{name: item.type || 'programme', params: {id: id}}"
        class="px-sm"
        :class="{off: item.status==='draft', 'text-pink-700': item.status==='internal'}">
        {{item.title}}
      </router-link>
    </div>
  </div>
</template>

<script>
import { db } from '../lib/firebase'

export default {
  name: 'AsideMenuPublic',
  props: {},

  data: () => ({
    publicMenuItems: {},
    unsubscribe: {}
  }),

  created () {
    this.subscribeMenu()
  },

  beforeDestroy () {
    Object.values(this.unsubscribe).forEach(u => {
      if (typeof u === 'function') u()
    })
  },

  methods: {
    subscribeMenu () {
      this.unsubscribe.menu = db.collection('settings')
        .doc('publicMenu')
        .onSnapshot(snap => {
          this.publicMenuItems = (snap.data() || {}).items
          this.$emit('updated')
        })
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../styles/vars";
  #app .aside-menu {
    .menu-item {
      a {
        text-transform: capitalize;
        &.off {
          @apply text-gray-400 italic;
        }
      }
      .handle:active {
        i { @apply text-aba-blue; }
      }
      .edit-button {
        opacity: 0;
        transition: opacity 0.1s;
        margin-left: auto;
      }
      &:hover {
        .edit-button { opacity: 1 }
      }
    }
    .popper-trigger {
      display: flex;
      width: min-content;
    }
  }
</style>
