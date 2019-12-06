<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div class="login-container">
    <p class="message" :class="{error:message}">
      {{ message }}
    </p>
    <form class="login-box" @submit.prevent="login">
      <label>
        <span>Email</span>
        <input
          ref="email"
          v-model="userEmail"
          placeholder="Email"
          type="email"
          @focus="message=''">
      </label>
      <label>
        <span>Password</span>
        <input
          v-model="userPassword"
          placeholder="Password"
          type="password"
          autocomplete="current-password"
          @focus="message=''">
      </label>
      <input
        type="submit"
        value="Log In"
        :disabled="!enableLogin">
      <button
        class="mini transparent"
        @click="redirectTo('forgot-password')">
        Forgot My Password
      </button>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { auth } from '../../lib/firebase'

export default {
  name: 'Login',
  components: {},
  data () {
    return {
      userEmail: '',
      userPassword: '',
      message: ''
    }
  },
  computed: {
    ...mapState(['user']),

    enableLogin () {
      return this.userEmail && this.userPassword
    }
  },

  mounted () {
    this.$refs.email.focus()
  },

  methods: {
    login () {
      auth.signInWithEmailAndPassword(this.userEmail, this.userPassword).catch(err => {
        console.log(err)
        if (err.code === 'auth/wrong-password') {
          this.message = 'Wrong password.'
        } else {
          this.message = err.message
        }
      })
    },
    redirectTo (routeName) {
      this.$router.replace({ name: routeName })
    }
  }
}
</script>
