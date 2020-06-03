<template>
  <div class="main-header">
    <nav>
      <router-link :to="{name: 'home'}" class="nav-item flex justify-center">
        <a-b-a-logo />
      </router-link>
      <template v-if="showPostFilters">
      </template>
      <user-menu class="user-menu" />
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import UserMenu from './UserMenu'
import ABALogo from './ABALogo'

export default {
  name: 'MainHeader',
  components: { ABALogo, UserMenu },
  data: () => ({}),

  computed: {
    ...mapState(['user', 'showDraftsInGrid']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    admin () {
      return this.user && this.user.role === 'admin'
    },
    showPostFilters () {
      return !!this.user
    },
    showDraftsMessage () {
      return this.showDraftsInGrid ? 'Hide Drafts' : `Show ${!this.adminOrEditor ? 'Mine ' : ''}Drafts`
    }
  },

  methods: {
    ...mapActions(['logOut', 'toggleDraftsInGrid'])
  }
}
</script>

<style lang='scss'>
  @import "../../styles/vars";

  .main-header{
    height: $base-size;

    display: flex;
    align-items: center;

    padding: 0;

    z-index: $z-index-header;

    pointer-events: none;

    nav {
      display: flex;
      align-items: center;
      width: 100%;
      pointer-events: all;

      a {
        &.nav-item {
          display: flex;
          align-items: center;
          height: $base-size * 0.75;
          background: $color-bg-semitransparent;
          padding: $base-padding /2 $base-padding;
        }
      }
    }

    .login {
      flex-shrink: 0;
      margin-left: auto;
      pointer-events: all;
    }

  }

  .user-actions {
    padding: $base-padding / 2;
    background: $color-bg;
  }
</style>
