<template>
  <form class="user-editor" @submit.prevent="submit">
    <label>Name<input v-model="displayName"></label>
    <label>Email<input v-model="email" type="email"></label>
    <label>Password<input v-model="password" type="password"></label>
    <label>Phone Number<input v-model="phoneNumber"></label>
    <button type="submit">Submit</button>
  </form>
</template>

<script>
export default {
  name: 'UserEditor',
  components: {
  },

  props: {
    user: { type: Object, default: null }
  },

  data: () => ({
    uid: '',
    displayName: '',
    email: '',
    password: '',
    phoneNumber: '',
    photoURL: '',
    emailVerified: false,
    disabled: false
  }),

  computed: {
  },

  watch: {
    user () {
      this.update()
    }
  },

  created () {
    this.update()
  },

  methods: {
    submit () {
      this.$emit('submit', {
        uid: this.uid,
        displayName: this.displayName,
        email: this.email,
        password: this.password,
        phoneNumber: this.phoneNumber,
        photoURL: this.photoURL,
        emailVerified: this.emailVerified,
        disabled: this.disabled
      })
    },

    update () {
      this.uid = this.user ? this.user.uid || '' : ''
      this.displayName = this.user ? this.user.displayName || '' : ''
      this.email = this.user ? this.user.email || '' : ''
      this.password = this.user ? this.user.password || '' : ''
      this.phoneNumber = this.user ? this.user.phoneNumber || '' : ''
      this.photoURL = this.user ? this.user.photoURL || '' : ''
      this.emailVerified = this.user ? this.user.emailVerified || false : false
      this.disabled = this.user ? this.user.disabled || false : false
    }
  }

}
</script>

<style lang='scss'>
  .user-editor{
  }
</style>
