<template>
  <div class="aside-menu">
    <smooth-reflow>
      <header v-if="adminOrEditor" class="flex justify-end">
        <button :class="{compact:!editMenu}" @click="editMenu = !editMenu">
          <i v-if="!editMenu" class="material-icons text-base">edit</i>
          <span v-else>Done</span>
        </button>
      </header>
    </smooth-reflow>
    <smooth-reflow>
      <aside-menu-editor v-if="editMenu && adminOrEditor" @updated="emitRefresh"/>
      <aside-menu-public v-else @updated="emitRefresh"/>
    </smooth-reflow>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AsideMenuEditor from './AsideMenuEditor'
import AsideMenuPublic from './AsideMenuPublic'
import SmoothReflow from '../components/UI/SmoothReflow'

export default {
  name: 'AsideMenu',
  components: { SmoothReflow, AsideMenuPublic, AsideMenuEditor },

  data: () => ({
    editMenu: false
  }),

  computed: {
    ...mapState(['requestToLogin', 'user', 'showEditor']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  watch: {
    editMenu () {
      this.emitRefresh()
    }
  },

  methods: {
    emitRefresh () { this.$nextTick(() => this.$emit('refresh')) }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  #app .aside-menu {
    .menu-item {
      @apply px-base;
      &.internal {
        @apply bg-gray-100;
      }
    }
  }
</style>
