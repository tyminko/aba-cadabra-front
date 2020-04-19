<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <div class="login-container forgot bg-white px-sm">
    <button class="flex items-center">
      <i class="material-icons text-xl text-gray-600 hover:text-aba-blue" @click="$emit('close')">close</i>
    </button>
    <div class="px-sm mb-sm">Reset Password</div>
    <form
      ref="form"
      class="login-box"
      @submit.prevent="sendRequest">
        <px-input
          ref="email"
          v-model="userEmail"
          label="Email"
          type="email"
          hint="Request an email with the password resetting details."
          :error="error"
          :validate-on-blur="true"
          :rules="[rules.required, rules.email, rules.serverError]"
          @input="clearMessage" />
        <div v-if="message" class="desc px-sm" :class="{open: message}">
          {{message}}
        </div>
    </form>
    <div class="flex justify-end">
      <button
        :disabled="!enableRequest"
        @click="sendRequest"
        class="submit w-auto p-sm">
        Send Email
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { auth } from '../../../lib/firebase'
import PxInput from '../UI/inputs/PxInput'

export default {
  name: 'ForgotPasswordForm',
  components: { PxInput },
  data () {
    return {
      userEmail: '',
      savedEmail: '',
      emailIsSent: false,
      messageBarOpen: false,
      error: null,
      rules: {
        required: value => (!!value || this.emailIsSent) || 'Required',
        email: value => /.+@.+\..+/.test(value) || 'E-mail must be valid',
        serverError: value => !this.error || (this.errorMessages[this.error.code] || this.errorMessages.default)
      },
      errorMessages: {
        'auth/user-not-found': 'There is no user with this email address.',
        'auth/invalid-email': "It doesn't look like an email address.",
        'default': 'Sorry, there was a problem with sending a message to this email address.'
      }
    }
  },
  computed: {
    ...mapState(['user']),
    message () {
      if (this.emailIsSent) {
        return `An Email with the password resetting details has been sent to ${this.savedEmail}.`
      }
      // } else if (this.error) {
      //   return this.errorMessages[this.error.code] || this.errorMessages.default
      // }
      return ''
    },
    formValid () {
      return (this.userEmail && (this.$refs.email || {}).isValid)
      // const pxInputs = [this.$refs.email]
      // // !!! DEBUG !!!
      // console.log(`%c formValid() %c pxInputs.find(input => !input.isValid): `, 'background:#ffbb00;color:#000', 'color:#00aaff', pxInputs.find(input => !input.isValid))
      // return pxInputs.find(input => !input.isValid).length === 0
    },
    enableRequest () {
      return this.formValid
    }
  },

  mounted () {
    this.$refs.email.focus()
  },

  methods: {
    sendRequest () {
      auth.sendPasswordResetEmail(this.userEmail)
        .then(() => {
          this.emailIsSent = true
          this.savedEmail = this.userEmail
          this.userEmail = ''
          this.error = null
        })
        .catch(err => {
          this.error = this.errorMessages[err.code] || this.errorMessages.default
        })
    },

    redirectTo (routeName) {
      this.$router.replace({ name: routeName })
    },

    clearMessage () {
      this.error = null
      this.emailIsSent = false
      this.savedEmail = ''
      // if (this.message) this.message = ''
    }
  }
}
</script>

<style lang='scss'>
</style>
