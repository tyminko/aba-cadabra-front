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
        this.$router.push(localData.get('last-visited-route') || { name: 'works' })
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
