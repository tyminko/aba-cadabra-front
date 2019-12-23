<!--suppress HtmlFormInputWithoutLabel -->
<template>
  <v-card class="login-container">
    <v-card-title>
      Reset Password
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
            :rules="[rules.required, rules.email]"
            @input="clearMessage" />
          <p class="message" :class="{open: message}">
            {{message}}
          </p>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <button
        :disabled="!enableRequest"
        @click="sendRequest">
        Log In
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
          console.log(err)
          this.error = err
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

    .v-card__title {
      padding-top: 0;
    }
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
