<template>
  <div class="users">
    <v-dialog
      ref="editor"
      v-model="showEditor"
      persistent
      scrollable
      transition="slide-x-transition"
      max-width="700"
      :fullscreen="viewportIsSmall"
      class="user-editor">
      <template v-slot:activator="{ on }">
        <v-btn color="primary" v-on="on" depressed :ripple="false">Add User</v-btn>
      </template>
      <user-editor
        :user="selectedUser"
        @close="showEditor=false"
        @complete="updateUserInList"/>
    </v-dialog>
    <div v-for="user in users" :key="user.uid" class="user-card">
      <div class="photo"  >
        <img v-if="user.photoURL" :src="user.photoURL">
      </div>
      <div class="name">{{user.displayName || user.email}}</div>
      <div class="email">Email: {{user.email}}</div>
      <div class="phone">Phone: {{user.phoneNumber}}</div>
      <div class="role">Role: {{user.role}}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import firebase from 'firebase'
// import { UiButton, UiModal } from 'keen-ui'
// import PopoverModal from '../../components/UI/PopoverModal'
import UserEditor from './UserEditor'

export default {
  name: 'Users',
  components: {
    UserEditor
  },

  data: () => ({
    users: [],
    selectedUser: null,
    allUsersFunc: null,
    nextPageToken: '',
    viewportIsSmall: false,
    showEditor: false
  }),

  computed: {
    ...mapState(['user'])
  },

  watch: {
    user () {
      this.getUsers()
    }
  },

  created () {
    this.getUsers()
    this.isViewportSmall()
    window.addEventListener('resize', this.isViewportSmall)
  },

  methods: {
    async getUsers () {
      if (this.user && this.user.role === 'admin') {
        this.allUsersFunc = firebase.functions().httpsCallable('users-all')
        const res = await this.allUsersFunc()
        if (res.data.error) {
          console.error(res.data.error)
        } else {
          this.users = res.data
        }
      }
    },

    updateUserInList (userData) {
      /* DEBUG */
      console.log(`%c updateUserInList %c userData: `, 'background:#ffbb00;color:#000', 'color:#00aaff', userData)
      if (!userData.uid) return
      const index = this.users.findIndex(u => u.uid === userData.uid)
      /* DEBUG */
      console.log(`%c %c index: `, 'background:#ffbb00;color:#000', 'color:#00aaff', index)
      if (index > -1) {
        this.$set(this.users, index, { ...userData })
      } else {
        this.users.unshift(userData)
      }
      /* DEBUG */
      console.log(`%c %c this.users: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.users)
    },

    openEditor () {
      this.$refs.editor.open()
    },

    isViewportSmall () {
      this.viewportIsSmall = window.innerWidth < 600 || window.innerHeight < 400
    }
  }
}
</script>

<style lang='scss'>
  .users{
    // position: relative;
  }
</style>
