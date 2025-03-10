<template>
  <div id="app">
    <layout-with-push-sidebar>
      <template #header>
        <main-header />
      </template>
      <template #sidebar>
        <aside-menu />
      </template>
      <template #content>
        <router-view-wrap />
      </template>
    </layout-with-push-sidebar>
    <editor v-if="editorToOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import LayoutWithPushSidebar from './views/components/UI/layouts/LayoutWithPushSidebar.vue'
import MainHeader from './views/components/MainHeader.vue'
import Editor from './views/editor/Editor.vue'
import AsideMenu from './views/menu/AsideMenu.vue'
import RouterViewWrap from './views/components/RouterViewWrap.vue'

const store = useStore()
const editorToOpen = computed(() => store.state.editorToOpen)
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
