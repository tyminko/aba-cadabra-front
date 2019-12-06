<template>
  <div id="app">
    <main-header />
    <keep-alive>
      <router-view :key="$route.fullPath" />
    </keep-alive>
    <popover-modal v-if="requestToLogin">
      <login-form />
    </popover-modal>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import MainHeader from './components/MainHeader'
import PopoverModal from './components/UI/PopoverModal'
import LoginForm from './components/login/LoginForm'

export default {
  name: 'App',
  components: { MainHeader, PopoverModal, LoginForm },
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
  @import "./styles/main.scss"
</style>
