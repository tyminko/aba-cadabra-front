<template>
  <div class="">
    <div class="flex justify-end">
      <dropdown-select
        v-if="allowChangePermissions"
        label="Status"
        v-model="abaStatus"
        :options="statuses"
        class="mr-base"/>
      <dropdown-select
        v-if="allowChangePermissions"
        label="Access Level"
        v-model="accessLevel"
        :options="roles"
        :disabled="ownProfile" />
    </div>
    <px-input
      v-model="displayName"
      label="Name"
      no-spellcheck
      class="lg"
      :rules="[rules.required]" />
    <smooth-reflow>
      <px-input
        v-if="abaStatus==='staff'"
        v-model="profileData.abaPosition"
        label="Team Position" />
      <template v-else-if="abaStatus==='resident'">
      <div class="flex flex-row flex-wrap">
        <date-time-picker
          v-model="profileData.residencyStart"
          required
          label="Residency Start"
          date-only
          class="mr-base"/>
        <date-time-picker
          v-model="profileData.residencyEnd"
          label="Residency End"
          date-only
          class="flex-1"/>
      </div>
      <tags-input
        v-model="supportedBy"
        placeholder="Add Institution"
        label="Supported By"
        :query="institutionsQuery"
        :allow-creation="false"/>
      </template>
    </smooth-reflow>
    <px-input
      v-model="userEmail"
      label="Email"
      no-spellcheck
      :rules="[rules.required, rules.email]" />
    <transition>
      <button
        v-if="!isNew && allowEditSensitiveData"
        class="px-sm transition-spacing duration-100"
        :class="changePassword ? 'mb-0' : 'mb-8'"
        @click.prevent="togglePassword">
        <span>{{changePassword ? `Don't Change Password` : 'Change Password'}}</span>
        <i v-if="changePassword" class="material-icons ml-sm text-gray-500 hover:aba-blue">close</i>
      </button>
    </transition>
    <smooth-reflow v-if="allowEditSensitiveData">
      <px-input
        v-if="changePassword || isNew"
        ref="password"
        v-model="password"
        no-spellcheck
        spellcheck="false"
        label="Password"
        :placeholder="isNew ? 'Password' : 'New Password'"
        :autocomplete="uid ? 'current-password' : 'new-password'"
        :type="showPassword ? 'text' : 'password'"
        :rules="[rules.password]"
        @blur="generatePasswordIfEmpty">
        <template v-slot:add-on>
          <button class="compact px-sm" @click.prevent="showPassword = !showPassword">
            <i class="material-icons">{{showPassword ? 'visibility' : 'visibility_off'}}</i>
          </button>
        </template>
        <template v-slot:desc>Leave it empty to generate a strong password.</template>
      </px-input>
    </smooth-reflow>
    <attachments-editor ref="attachments-editor" v-model="attachments"/>
    <text-editor v-model="text" label="About"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { db } from '../../lib/firebase'
import { addUser, updateUser, generatePassword } from '../../lib/users'
import PxInput from '../components/UI/inputs/PxInput'
import SmoothReflow from '../components/UI/SmoothReflow'
import DropdownSelect from '../components/UI/DropdownSelect'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import TextEditor from '../components/UI/TextEditor'
import DateTimePicker from '../components/UI/inputs/DateTimePicker'
import TagsInput from '../components/UI/inputs/TagsInput'

export default {
  name: 'ProfileEditor',
  components: {
    TagsInput,
    DateTimePicker,
    TextEditor,
    AttachmentsEditor,
    DropdownSelect,
    SmoothReflow,
    PxInput
  },

  props: {
    value: { type: Object, default: null }
  },

  data: function () {
    return {
      uid: '',
      profileData: {},
      profileDataOriginalJSON: null,
      defaultProfileData: {
        displayName: '',
        photoURL: '',
        photo: '',
        links: '',
        text: '',
        attachments: '',
        participatedIn: '',
        abaPosition: '',
        residencyStart: 0,
        residencyEnd: 0,
        supportedBy: [],
        country: ''
      },
      email: '',
      roles: ['visitor', 'contributor', 'editor', 'admin'],
      role: '',
      status: '',
      statuses: { 'resident': 'Resident', 'staff': 'Team member', 'guest': 'Guest' },
      institutions: null,
      password: '',
      changePassword: false,
      showPassword: true,
      processing: false,
      tags: [],
      visitedFields: {},
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
    }
  },

  computed: {
    ...mapState(['user']),
    isAdmin () { return (this.user || {}).role === 'admin' },
    ownProfile () { return this.user.uid === (this.value || {}).uid },
    allowChangePermissions () { return this.isAdmin },
    allowEditSensitiveData () { return this.isAdmin || this.ownProfile },

    userData () { return this.value },
    isNew () { return !(this.value || {}).uid },

    abaStatus: {
      get () {
        if (this.status) return this.status
        if (!this.profileData.abaPosition) return 'guest'
        switch (this.profileData.abaPosition) {
          case 'resident':
          case 'guest':
            return this.profileData.abaPosition
          default: return 'staff'
        }
      },
      set (newValue) { this.status = newValue }
    },

    displayName: {
      get () { return this.profileData.displayName || (this.userData || {}).displayName || '' },
      set (newValue) {
        this.$set(this.profileData, 'displayName', newValue)
        this.$emit('set-header', this.editorTitle)
      }
    },

    userEmail: {
      get () { return this.email || (this.userData || {}).email || '' },
      set (newValue) { this.email = newValue }
    },

    accessLevel: {
      get () { return this.role || (this.userData || {}).role || 'visitor' },
      set (newValue) { this.role = newValue }
    },

    text: {
      get () { return this.profileData.text || this.profileData.description || '' },
      set (newValue) { this.$set(this.profileData, 'text', newValue) }
    },

    attachments () {
      return this.profileData.attachments || []
    },

    supportedBy: {
      get () { return this.profileData.supportedBy || [] },
      set (newValue) { this.$set(this.profileData, 'supportedBy', newValue) }
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
    emailValid () { return !this.visitedFields.email || this.email.length > 0 },
    passwordValid () { return !this.visitedFields.password || this.password.length > 8 },
    editorTitle () {
      return (this.value || {}).uid ? this.displayName || this.userEmail : 'New'
    }
  },

  watch: {
    value () {
      this.profileData = { ...this.defaultProfileData }
    },
    user () {
      this.setProfileData()
    }
  },

  created () {
    this.setProfileData()
    this.$emit('set-header', this.editorTitle)
  },

  methods: {
    async setProfileData () {
      const profileId = (this.userData || {}).uid
      if (!profileId) return null
      this.profileData = await db.collection('profiles')
        .doc(profileId)
        .get()
        .then(doc => {
          return doc.data()
        })
        .catch(err => {
          console.error('Profile Data:', err)
          this.profileData = { ...this.defaultProfileData }
        })
      this.profileDataOriginalJSON = JSON.stringify(this.profileData)
    },

    async togglePassword () {
      this.changePassword = !this.changePassword
      this.password = ''
      await this.$nextTick()
      if (this.$refs.password) this.$refs.password.focus()
    },

    fieldVisited (field) {
      this.$set(this.visitedFields, field, true)
    },

    submit () {
      if (!this.formValid) return
      if (!this.uid) {
        this.createUser()
      }
    },

    async createUser () {
      if ((this.user || {}).role === 'admin') {
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
        const newUser = await addUser(data)
        if (newUser) {
          this.$emit('complete', newUser)
          this.$refs.form.reset()
          this.requestClose()
        }
      }
    },

    async saveUserData () {
      let userData = { ...this.userData }
      const userFields = {}
      if (this.profileData.displayName !== userData.displayName) {
        userFields.displayName = this.profileData.displayName
      }
      if (this.userEmail !== userData.email) userFields.email = this.userEmail
      if (this.password) userFields.password = this.password
      if (this.disabled) userFields.disabled = this.disabled
      if (this.isAdmin &&
        !this.ownProfile &&
        this.role !== userData.role) userFields.role = this.role
      if (Object.keys(userFields).length) {
        userFields.id = this.userData.uid
        try {
          userData = await updateUser(userFields)
          return userData
        } catch (e) {
          return Promise.reject(e)
        }
      }
      return userData
    },

    saveAttachments () {
      const attachmentsEditor = this.$refs['attachments-editor']
      if (attachmentsEditor) {
        return attachmentsEditor.processAttachments()
      }
    },

    async save () {
      this.$emit('setProcessing', true)
      let userData = await this.saveUserData()
      if (!userData || !userData.uid) return

      try {
        const attachmentsData = await this.saveAttachments()
        this.$set(this.profileData, 'attachments', attachmentsData)

        const profileFields = this.profileFieldsToSave()
        if (Object.keys(profileFields).length) {
          await db.collection('profiles').doc(userData.uid).update(profileFields)
          this.$emit('setProcessing', false)
          this.$emit('saved', { uid: userData.uid, data: profileFields })
          this.$emit('close')
        } else {
          this.$emit('setProcessing', false)
        }
      } catch (e) {
        this.$emit('setProcessing', false)
      }
    },

    profileFieldsToSave () {
      const original = { ...JSON.parse(this.profileDataOriginalJSON || null) }
      return Object.keys(this.defaultProfileData).reduce((res, key) => {
        if (typeof this.profileData[key] === 'undefined') return res
        if (original.hasOwnProperty(key)) {
          if (this.profileData[key] !== original[key]) {
            res[key] = this.profileData[key]
          }
        } else {
          if (this.profileData[key] !== this.defaultProfileData[key]) {
            res[key] = this.profileData[key]
          }
        }
        return res
      }, {})
    },

    updateAuthorInPostsByUser () {
      const batch = db.batch()
      db.collection('posts').where('author.uid', '==', this.userData.uid)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            batch.update(db.collection('posts').doc(doc.id), { displayName: this.userData.displayName })
          })
        })
      return batch.commit()
    },

    async institutionsQuery (str) {
      if (!this.institutions) {
        this.institutions = await db.collection('institutions')
          .get()
          .then(snapshot => {
            return snapshot.docs.map(doc => {
              const { title } = doc.data()
              return { id: doc.id, title }
            })
          })
      }
      return this.institutions.filter(i => i.title.toLowerCase().includes(str.toLowerCase()))
    },

    generatePasswordIfEmpty () {
      if (!this.password) {
        this.password = generatePassword()
      }
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
