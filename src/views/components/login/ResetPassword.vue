<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div class="login-container reset-password">
    <template v-if="tokenIsOk">
      <p class="message">
        {{ $t('login.header.Reset you Password') }}
      </p>
      <float-label>
        <input v-model="userPassword"
               :placeholder="$t('login.label.Password')"
               type="password">
      </float-label>
      <float-label>
        <input v-model="userPasswordCheck"
               :placeholder="$t('login.label.Repeat Password')"
               type="password">
      </float-label>

      <button :disabled="!enableResetPassword" @click="resetPassword">
        {{ $t('login.button.Reset Password') }}
      </button>
    </template>

    <template v-else>
      <p class="message">
        {{ $t('login.message.InvalidToken') }}
      </p>
      <button class="mini" @click="redirect">
        {{ $t('login.button.Request another link') }}
      </button>
    </template>
  </div>
</template>

<script>
import FloatLabel from '../../../components/UI/FloatLabel'

export default {
  name: 'ResetPassword',
  components: { FloatLabel },

  data: () => ({
    userPassword: '',
    userPasswordCheck: '',
    tokenIsOk: false
  }),

  computed: {
    passwordIsValid () {
      return this.userPassword.length > 8 // TODO proper password validation
    },
    passwordsIdentical () {
      return this.userPassword === this.userPasswordCheck
    },
    enableResetPassword () {
      return this.passwordIsValid && this.passwordsIdentical
    }
  },

  watch: {
    '$route' () {
      this.validateToken()
    }
  },

  mounted () {
    this.validateToken()
  },

  methods: {
    validateToken () {
      // TODO proper token validation
      this.tokenIsOk = this.$route.params.token && this.$route.params.token === 'qwerty'
    },

    resetPassword () {
      // TODO IMPLEMENT RESET PASSWORD!!!
      console.log(`%c resetPassword() %cIMPLEMENT RESET PASSWORD!!!`, 'background:#ffbb00;color:#000', 'color:#00aaff')
    },

    redirect () {
      this.$router.replace({ name: 'forgot-password' })
    }
  }
}
</script>

<style lang="scss">
  .reset-password {
  }
</style>
