<template>
  <div id="app">
    <layout-with-push-sidebar>
      <template v-slot:header>
        <main-header />
      </template>
      <template v-slot:sidebar="{refresh}">
        <aside-menu @refresh="refresh" />
      </template>
      <template v-slot:content>
        <router-view :key="$route.fullPath"/>
      </template>
    </layout-with-push-sidebar>
    <editor
      v-if="user && showEditor"
      id="main-editor"
      :value="showEditor.value"
      :type="showEditor.type"
      :on-saved="showEditor.onSaved"
      :open="!!showEditor"
      @close="hideEditor"/>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import LayoutWithPushSidebar from './views/components/UI/layouts/LayoutWithPushSidebar'
import MainHeader from './views/components/MainHeader'
import Editor from './views/editor/Editor'
import AsideMenu from './views/menu/AsideMenu'

export default {
  name: 'App',
  components: { AsideMenu, Editor, LayoutWithPushSidebar, MainHeader },
  computed: {
    ...mapState(['requestToLogin', 'user', 'showEditor']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    showSecondView () {
      return this.$route.name !== 'home'
    }
  },
  created () {
    this.detectTouching()
  },
  methods: {
    ...mapActions(['setUseTouch', 'hideEditor']),

    detectTouching () {
      window.addEventListener('touchstart', function onFirstTouch () {
        this.setUseTouch()
        window.removeEventListener('touchstart', onFirstTouch, false)
      }.bind(this), false)
    }
  }
}
</script>
<style lang="scss">
  @import "https://fonts.googleapis.com/icon?family=Material+Icons";
  @import "./styles/main.scss";

  #app {
    margin-top: $base-size;
  }
</style>
