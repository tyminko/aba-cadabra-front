<template>
  <form class="user-editor" @submit.prevent="submit">
    <ui-textbox
      v-model="displayName"
      label="Name"
      floating-label />
    <ui-textbox
      v-model="email"
      label="Email"
      autocomplete="new-password"
      :invalid="!emailValid"
      @touch="fieldVisited('email')"
      floating-label />
    <!-- <label>Name<input v-model="displayName"></label> -->
    <!-- <label>Email<input v-model="email" type="email"></label> -->
    <!-- <label>Password<input v-model="password" type="password"></label> -->
    <!-- <label>Phone Number<input v-model="phoneNumber"></label> -->
    <ui-select
      v-model="role"
      :options="roles"
      :help="roleDesc"
      floating-label
      label="Accsess Level">
    </ui-select>
    <ui-textbox
      v-model="password"
      label="Password"
      :invalid="!passwordValid"
      @touch="fieldVisited('password')"
      floating-label />
    <ui-button type="submit" :loading="processing" icon="add">{{submitButtonText}}</ui-button>
  </form>
</template>

<script>
import { UiButton, UiSelect, UiTextbox } from 'keen-ui'
import configure from 'keen-ui/src/configure'
import 'keen-ui/dist/keen-ui.css'

configure(UiButton, { disableRipple: true })

export default {
  name: 'UserEditor',
  components: {
    UiButton, UiSelect, UiTextbox
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
    visitedFileds: {}
  }),

  computed: {
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
          return 'Can manage his/hers Own Posts'
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
    autoPassword () {
      return ''
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
      this.processing = true
      this.$emit('submit', {
        uid: this.uid,
        displayName: this.displayName,
        email: this.email,
        password: this.password,
        phoneNumber: this.phoneNumber,
        photoURL: this.photoURL,
        emailVerified: this.emailVerified,
        disabled: this.disabled
      })
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
    }
  }

}
</script>

<style lang='scss'>
  .ui-select__display-value, .ui-select-option > * {
    text-transform: capitalize
  }
</style>
