<template>
  <header class="main-header">
    <nav class="collaps">
      <router-link :to="{name: 'works'}" class="nav-item">
        Works
      </router-link>
      <router-link :to="{name: 'about'}" class="nav-item">
        About
      </router-link>
    </nav>
    <button v-if="user" class="login" @click="logOut">
      Log Out
    </button>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'MainHeader',
  components: {
  },

  props: {
  },

  data: () => ({
  }),

  computed: {
    ...mapState(['user'])
  },

  methods: {
    ...mapActions(['logOut'])
  }
}
</script>

<style lang='scss'>
  @import "../styles/_vars.scss";

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
      background: transparentize($color-bg, 0.1);
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
</style>
