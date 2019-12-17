<template>
  <div class="login-container forgot-password">
    <p class="message" :class="{ok:emailIsSent, error:error}">
      {{ message }}
    </p>
    <template v-show="!emailIsSent">
      <float-label>
        <input v-model="userEmail" placeholder="Email" type="email" @focus="reset">
      </float-label>
      <button :disabled="!enableSendEmail" @click="sendResetPasswordEmail">
        Send Email
      </button>
    </template>
  </div>
</template>

<script>
import { auth } from '../../../lib/firebase'

export default {
  name: 'ForgotPassword',

  data: () => ({
    userEmail: '',
    savedEmail: '',
    error: null,
    emailIsSent: false
  }),

  computed: {
    message () {
      if (this.emailIsSent) {
        return this.$t('login.message.EmailSent', { emailAddress: this.savedEmail })
      } else if (this.error) {
        return this.$te(`login.message.Error.${this.error.code}`)
          ? this.$t(`login.message.Error.${this.error.code}`)
          : this.$t(`login.message.Error.Default`)
      }
      return this.$t('login.message.RequestEmail')
    },
    enableSendEmail () {
      return !!this.userEmail // TODO proper email validation
    }
  },

  methods: {
    sendResetPasswordEmail () {
      auth.sendPasswordResetEmail(this.userEmail)
        .then(() => {
          this.emailIsSent = true
          this.savedEmail = this.userEmail
          this.userEmail = ''
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log(err)
          this.error = err
        })
    },
    reset () {
      this.error = null
      this.emailIsSent = false
      this.savedEmail = ''
    }
  }
}
</script>

<style lang="scss">
  .forgot-password {
  }
</style>
