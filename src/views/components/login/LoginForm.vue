<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <v-card class="login-container">
    <v-card-title>
      Log In
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        v-model="formValid"
        class="login-box"
        @submit.prevent="login">
          <v-text-field
            ref="email"
            v-model="userEmail"
            label="Email"
            type="email"
            :rules="[rules.required, rules.email]"
            @input="clearMessage" />
          <v-text-field
            v-model="userPassword"
            label="Password"
            type="password"
            :rules="[rules.required]"
            spellcheck="false"
            autocomplete="current-password"
            @input="clearMessage" />
          <p class="message" :class="{open: message}">
            {{message}}
          </p>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <button
        :disabled="!enableLogin"
        @click="login">
        Log In
      </button>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import { auth } from '../../../lib/firebase'

export default {
  name: 'Login',
  components: {},
  data () {
    return {
      userEmail: '',
      userPassword: '',
      message: '',
      messageBarOpen: false,
      showPassword: false,
      rules: {
        required: value => !!value || 'Required',
        email: value => /.+@.+\..+/.test(value) || 'E-mail must be valid'
      },
      formValid: true
    }
  },
  computed: {
    ...mapState(['user']),

    enableLogin () {
      return this.formValid
    }
  },

  mounted () {
    this.$refs.email.focus()
  },

  methods: {
    login () {
      auth.signInWithEmailAndPassword(this.userEmail, this.userPassword).catch(err => {
        console.log(err)
        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          this.message = 'Wrong email or password.'
        } else {
          this.message = err.message
        }
        this.messageBarOpen = true
      })
    },

    redirectTo (routeName) {
      this.$router.replace({ name: routeName })
    },

    clearMessage () {
      if (this.message) this.message = ''
    }
  }
}
</script>

<style lang='scss'>
  @import '../../../styles/vars';
  .v-card.login-container {
    max-width: 300px;
    width: 100%;
    border: none;
    .message {
      height: 0;
      color: red;
      overflow: hidden;
      margin: 0;
      transition: height 0.2s;
      font-size: 1;

      &.open {
        height: $base-size;
      }
    }
  }
</style>
