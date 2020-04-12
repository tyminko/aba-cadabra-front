<template>
  <div class="login">
    <router-view />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import localData from '../lib/local-storage'

export default {
  name: 'Login',
  props: {
  },

  data: () => ({
  }),

  computed: {
    ...mapState(['user'])
  },

  watch: {
    user (value) {
      if (value) {
        const lastRoute = localData.get('last-visited-route')
        if ((lastRoute || {}).name !== this.$route.name) {
          this.$router.push(lastRoute || { name: 'home' })
        }
      }
    }
  },

  methods: {
  }
}
</script>

<style lang='scss'>
  .login{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
