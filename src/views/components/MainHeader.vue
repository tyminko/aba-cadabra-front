<template>
  <div class="main-header">
    <nav>
      <router-link :to="{name: 'home'}" class="nav-item">
        ABA
      </router-link>
      <user-menu class="user-menu" />
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import UserMenu from './UserMenu'

export default {
  name: 'MainHeader',
  components: { UserMenu },
  data: () => ({}),

  computed: {
    ...mapState(['user']),
    admin () {
      return this.user && this.user.role === 'admin'
    }
  },

  methods: {
    ...mapActions(['logOut'])
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
          margin-right: $base-padding;
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
