<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div class="login-wrap">
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
        <div @click="forgotPassword = true" class="link mini">
          Forgot my password
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <button
          :disabled="!enableLogin"
          @click="login">
          Log In
        </button>
      </v-card-actions>
    </v-card>
    <transition name="push">
      <forgot-form
        v-if="forgotPassword"
        :class="{open:forgotPassword}"
        class="forgot-form"
        @close="forgotPassword = false" />
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { auth } from '../../../lib/firebase'
import ForgotForm from './ForgotPasswordForm'

export default {
  name: 'Login',
  components: { ForgotForm },
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
      formValid: true,
      forgotPassword: false
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
        // eslint-disable-next-line no-console
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
  .login-wrap { position: relative; }
  .v-card.login-container {
    max-width: 300px;
    width: 100%;
    border: none;

    .v-card__title {
      padding-top: 0;
    }
    .message {
      height: 0;
      color: red;
      overflow: hidden;
      margin: 0;
      transition: height 0.2s 0.5s;
      font-size: 90%;

      &.open {
        // height: $base-size;
      }
    }
  }
  .forgot-form {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    // transition: left $transition-time;

    // &.open {
    //   left: 0;
    // }
  }

  .push-enter-active, .push-leave-active {
    transition: left $transition-time;
  }
  .push-enter, .push-leave-to {
    left: 100%;
  }
</style>
