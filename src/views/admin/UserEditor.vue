<template>
  <v-card>
    <v-card-title class="justify-space-between">
      <span>{{editorTitle}}</span>
      <v-btn text icon :ripple="false" class="mr-n3" @click="requestClose">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        v-model="formValid"
        class="user-editor"
        @submit.prevent="submit">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="displayName"
              label="Name"
              :rules="[rules.required]" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="email"
              label="Email"
              :rules="[rules.required, rules.email]" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="phoneNumber"
              label="Phone Number"
              :rules="[rules.phone]" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              label="Password"
              :value="password"
              hint="Leave it empty to generate a strong password."
              spellcheck="false"
              :autocomplete="uid ? 'current-password' : 'new-password'"
              :append-icon="showPassword ? 'visibility' : 'visibility_off'"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.password]"
              @blur="generatePasswordIfEmpty"
              @click:append="() => {showPassword = !showPassword}"
              @input="v=>password=v" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="role"
              :items="roles"
              :hint="roleDesc"
              :ripple="false"
              label="Accsess Level" />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="tags"
              :ripple="false"
              label="Tags" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn text :ripple="false" @click="requestClose">Cancel</v-btn>
      <v-btn
        color="primary"
        :loading="processing"
        :ripple="false"
        @click="submit">
        {{submitButtonText}}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import firebase from 'firebase'

// import { UiButton, UiSelect, UiTextbox } from 'keen-ui'
// import configure from 'keen-ui/src/configure'
// import 'keen-ui/dist/keen-ui.css'

// configure(UiButton, { disableRipple: true })

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
    disabled: false,
    processing: false,
    role: 'visitor',
    roles: ['visitor', 'contributor', 'editor', 'admin'],
    tags: [],
    showPassword: false,
    visitedFileds: {},
    rules: {
      required: value => !!value || 'Required',
      email: value => /.+@.+\..+/.test(value) || 'E-mail must be valid',
      phone: value => !value || /^\+(?:[0-9] ?){6,14}[0-9]$/.test(value) || 'Must be in the format: +1234567890',
      password: value => {
        if (!value) return true
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.?!:;()[\]{}~\-_`@#$%^&*+=])(?=.{8,})/
        return (
          pattern.test(value) ||
            'Min. 8 characters with at least one capital letter, a number and a special character.'
        )
      }
    },
    formValid: true
  }),

  computed: {
    ...mapState({ editor: 'user' }),

    submitButtonText () {
      return this.uid ? 'Update User' : 'Add User'
    },
    roleDesc () {
      switch (this.role) {
        case 'admin':
          return 'Can manage Users'
        case 'editor':
          return 'Can manage Others Posts'
        case 'contributor':
          return 'Can manage his/her Own Posts'
        case 'visitor':
          return 'Can only read'
        default:
          return ''
      }
    },
    emailValid () {
      return !this.visitedFileds.email || this.email.length > 0
    },
    passwordValid () {
      return !this.visitedFileds.password || this.password.length > 8
    },
    editorTitle () {
      return this.user && this.user.uid ? 'Edit User' : 'New User'
    }
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
    fieldVisited (field) {
      this.$set(this.visitedFileds, field, true)
    },

    submit () {
      if (!this.formValid) return
      if (!this.uid) {
        this.addUser()
      }
    },

    async addUser () {
      if (this.editor && this.editor.role === 'admin') {
        try {
          this.addUserFunc = firebase.functions().httpsCallable('users-add')
          const data = {
            displayName: this.displayName,
            email: this.email,
            password: this.password,
            phoneNumber: this.phoneNumber,
            photoURL: this.photoURL,
            emailVerified: this.emailVerified,
            disabled: this.disabled,
            role: this.role
          }
          this.processing = true
          const res = await this.addUserFunc(data)
          this.processing = false
          if (res.data.error) {
            // eslint-disable-next-line no-console
            console.error(res.data.error)
          } else {
            this.$emit('complete', res.data)
            this.$refs.form.reset()
            this.requestClose()
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }
      }
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
    },

    generatePasswordIfEmpty () {
      if (!this.password) {
        this.password = this.generatePassword()
      }
    },

    generatePassword () {
      const randCharFromStr = str => str.charAt(Math.floor(Math.random() * str.length))
      const length = 12
      const lows = 'abcdefghijklmnopqrstuvwxyz'
      const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const numbers = '0123456789'
      const specials = '.?!:;()[]{}~-_`@#$%^&*+='
      const charset = lows + specials + caps + numbers
      let checkLow, checkCap, checkNum, checkSpecial
      let retVal = ''
      for (let i = 0; i < length; ++i) {
        const char = randCharFromStr(charset)
        if (lows.includes(char)) checkLow = true
        if (caps.includes(char)) checkCap = true
        if (numbers.includes(char)) checkNum = true
        if (specials.includes(char)) checkSpecial = true
        retVal += char
      }
      if (!checkLow) retVal += randCharFromStr(lows)
      if (!checkCap) retVal += randCharFromStr(caps)
      if (!checkNum) retVal += randCharFromStr(numbers)
      if (!checkSpecial) retVal += randCharFromStr(specials)
      return retVal
    },

    requestClose () {
      this.$emit('close')
    }
  }

}
</script>

<style lang='scss'>
  .user-editor {
    background: #fff;
    .row > div {
      padding-top: 0;
      padding-bottom: 0;
    }
  }
  .v-select__selection, .v-list-item__title {
    text-transform: capitalize
  }
</style>
