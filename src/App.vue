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
        <router-view-wrap/>
      </template>
    </layout-with-push-sidebar>
    <router-view name="popup"/>
    <editor
      v-if="user && editorToOpen"
      id="main-editor"
      :value="editorToOpen.value"
      :type="editorToOpen.type"
      :on-saved="editorToOpen.onSaved"
      :open="!!editorToOpen"
      @close="hideEditor"/>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import LayoutWithPushSidebar from './views/components/UI/layouts/LayoutWithPushSidebar'
import MainHeader from './views/components/MainHeader'
import Editor from './views/editor/Editor'
import AsideMenu from './views/menu/AsideMenu'
import RouterViewWrap from './views/components/RouterViewWrap'

export default {
  name: 'App',
  components: { RouterViewWrap, AsideMenu, Editor, LayoutWithPushSidebar, MainHeader },
  computed: {
    ...mapState(['requestToLogin', 'user', 'editorToOpen', 'postToOpen']),
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
    ...mapActions(['setUseTouch', 'hideEditor', 'closePost']),

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
