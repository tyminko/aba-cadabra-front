<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div class="login-wrap">
    <div class="login-container px-sm">
      <div class="mb-sm px-sm">Log In</div>
      <div class="card-content">
        <form
          ref="form"
          class="login-box"
          @submit.prevent="login">
            <px-input
              ref="email"
              v-model="userEmail"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              @input="clearMessage" />
            <px-input
              v-model="userPassword"
              label="Password"
              type="password"
              :rules="[rules.required]"
              spellcheck="false"
              autocomplete="current-password"
              @input="clearMessage" />
            <p v-if="message" class="message" :class="{open: message}">
              {{message}}
            </p>
        </form>
        <a href="#" @click.prevent="forgotPassword = true" class="block px-sm text-sm text-gray-900 -mt-sm">
          Forgot my password
        </a>
      </div>
      <div class="flex justify-end">
        <button :disabled="!enableLogin" class="w-auto my-base px-sm" @click="login">
          <span>Log In</span>
        </button>
      </div>
    </div>
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
import PxInput from '../UI/inputs/PxInput'

export default {
  name: 'Login',
  components: { PxInput, ForgotForm },
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
