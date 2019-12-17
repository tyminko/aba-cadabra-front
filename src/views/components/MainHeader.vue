<template>
  <v-app-bar app flat class="main-header">
    <nav>
      <router-link :to="{name: 'home'}" class="nav-item">
        Home
      </router-link>
      <router-link :to="{name: 'about'}" class="nav-item">
        About
      </router-link>
      <router-link v-if="admin" :to="{name: 'users'}" class="nav-item">
        Users
      </router-link>
    </nav>
  </v-app-bar>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'MainHeader',
  components: { },
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
    position: fixed;
    top: 0;
    left: 0;
    height: $base-size;
    width: 100vw;

    display: flex;
    align-items: center;

    padding: 0 $base-padding;

    z-index: $z-index-header;

    pointer-events: none;

    nav {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      // background: transparentize($color-bg, 0.1);
      pointer-events: all;

      a {
        text-decoration: none;
        &.nav-item {
          margin-right: $base-padding;
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
    padding: $base-padding;
    background: $color-bg;
  }
</style>
