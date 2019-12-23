<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <v-card class="login-container forgot">
    <v-card-title>
      <v-icon @click="$emit('close')">close</v-icon> Reset Password
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        v-model="formValid"
        class="login-box"
        @submit.prevent="sendRequest">
          <v-text-field
            ref="email"
            v-model="userEmail"
            label="Email"
            type="email"
            hint="Request an email with the password resetting details."
            :validate-on-blur="true"
            :rules="[rules.required, rules.email, rules.serverError]"
            @input="clearMessage" />
          <p class="message" :class="{open: message}">
            {{message}}
          </p>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <button
        :disabled="!enableRequest"
        @click="sendRequest"
        class="submit">
        Send Email
      </button>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import { auth } from '../../../lib/firebase'

export default {
  name: 'ForgotPasswordForm',
  components: {},
  data () {
    return {
      userEmail: '',
      savedEmail: '',
      emailIsSent: false,
      messageBarOpen: false,
      error: null,
      formValid: true,
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
        })
        .catch(err => {
          this.error = err
          this.$refs.form.validate()
        })
    },

    redirectTo (routeName) {
      this.$router.replace({ name: routeName })
    },

    clearMessage () {
      this.error = false
      this.emailIsSent = false
      this.savedEmail = ''
      // if (this.message) this.message = ''
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

    .v-card__title {
      padding-top: 0;
    }
    .message {
      height: 0;
      overflow: hidden;
      margin: 0;
      transition: height 0.2s;
      // font-size: 90%;
      line-height: 1.3;
      color: #0000ff !important;

      &.open {
        height: auto;
      }

      &.error {
        color: red;
        background: transparent !important;
      }
    }

    button.submit {
      color: #0000ff;
      &:disabled {
        color: #ccc;
      }
    }
  }
</style>
