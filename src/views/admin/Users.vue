<template>
  <div class="users">
    <ui-button @click="openEditor">Add User</ui-button>
    <div v-for="user in users" :key="user.uid" class="user-card">
      <div class="photo">
        <img v-if="user.photoURL" :src="user.photoURL">
      </div>
      <div class="name">{{user.displayName || user.email}}</div>
      <div class="email">Email: {{user.email}}</div>
      <div class="phone">Phone: {{user.phoneNumber}}</div>
      <div class="role">Role: {{user.role}}</div>
    </div>
    <ui-modal ref="editor" :title="editorTitle" class="user-editor">
      <user-editor :user="selectedUser" />
    </ui-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import firebase from 'firebase'
import { UiButton, UiModal } from 'keen-ui'
// import PopoverModal from '../../components/UI/PopoverModal'
import UserEditor from './UserEditor'

export default {
  name: 'Users',
  components: {
    UiButton, UiModal, UserEditor
  },

  data: () => ({
    users: [],
    selectedUser: null,
    allUsersFunc: null,
    nextPageToken: ''
  }),

  computed: {
    ...mapState(['user']),
    editorTitle () {
      return this.selectedUser && this.selectedUser.uid ? 'Edit User' : 'New User'
    }
  },

  watch: {
    user () {
      this.getUsers()
    }
  },

  created () {
    this.getUsers()
  },

  methods: {
    async getUsers () {
      if (this.user && this.user.role === 'admin') {
        this.allUsersFunc = firebase.functions().httpsCallable('users-all')
        const res = await this.allUsersFunc()
        this.users = res.data
      }
    },

    openEditor () {
      this.$refs.editor.open()
    }
  }
}
</script>

<style lang='scss'>
  .users{
    position: relative;
  }
</style>
