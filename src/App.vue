<template>
  <div id="app">
    <layout-with-push-sidebar>
      <template v-slot:header>
        <main-header />
      </template>
      <template v-slot:sidebar>
        <ul class="sidebar-menu">
          <li>
            <router-link :to="{name:''}">About</router-link>
          </li>
          <li>
            <router-link :to="{name:''}">Salons</router-link>
          </li>
          <li>
            <router-link :to="{name:''}">Residency</router-link>
          </li>
          <li>
            <router-link :to="{name:''}">Residents</router-link>
          </li>
          <li>
            <router-link :to="{name:'partners'}">Partners</router-link>
          </li>
        </ul>
      </template>
      <template v-slot:content>
        <keep-alive>
          <router-view :key="$route.fullPath" />
        </keep-alive>
      </template>
    </layout-with-push-sidebar>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import LayoutWithPushSidebar from './views/components/UI/LayoutWithPushSidebar'
import MainHeader from './views/components/MainHeader'

export default {
  name: 'App',
  components: { LayoutWithPushSidebar, MainHeader },
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

  .sidebar-menu {
    padding: 0 $base-padding;
    li {
      font-size: 150%;
      padding: $base-padding / 2 0;
      color: $color-aba-blue;
      &:hover {
        color: $color-aba-blue;
        text-decoration: underline;
      }
    }
  }
</style>
