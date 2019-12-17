<template>
  <v-app id="app" class="bg">
    <main-header />
    <user-menu class="user-menu" />
    <v-content>
      <v-container fluid>
        <keep-alive>
          <router-view :key="$route.fullPath" />
        </keep-alive>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import MainHeader from './views/components/MainHeader'
import UserMenu from './views/components/UserMenu'

export default {
  name: 'App',
  components: { MainHeader, UserMenu },
  computed: {
    ...mapState(['requestToLogin'])
  },
  created () {
    this.detectTouching()
  },
  methods: {
    ...mapActions(['seltUseTouch']),

    detectTouching () {
      window.addEventListener('touchstart', function onFirstTouch () {
        this.seltUseTouch()
        window.removeEventListener('touchstart', onFirstTouch, false)
      }.bind(this), false)
    }
  }
}
</script>
<style lang="scss">
  @import "https://fonts.googleapis.com/icon?family=Material+Icons";
  @import "./styles/main.scss";
  .user-menu {
    position: fixed;
    top: 0;
    right: 0;
    z-index: $z-high;
    margin-right: 10px;
  }
</style>
