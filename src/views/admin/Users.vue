<template>
  <div class="users">
    <button @click="openEditor = true">Add User</button>
    <div v-for="user in users" :key="user.uid" class="user-card">
      <div class="photo">
        <img v-if="user.photoURL" :src="user.photoURL">
      </div>
      <div class="name">{{user.displayName || user.email}}</div>
      <div class="email">Email: {{user.email}}</div>
      <div class="phone">Phone: {{user.phoneNumber}}</div>
      <div class="role">Role: {{user.role}}</div>
    </div>
    <popover-modal class="user-editor" :open="openEditor" @close="openEditor = false">
      <user-editor :user="selectedUser" />
    </popover-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import firebase from 'firebase'
import PopoverModal from '../../components/UI/PopoverModal'
import UserEditor from './UserEditor'

export default {
  name: 'Users',
  components: {
    PopoverModal, UserEditor
  },

  data: () => ({
    users: [],
    selectedUser: null,
    allUsersFunc: null,
    nextPageToken: '',
    openEditor: false
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
  },

  methods: {
    async getUsers () {
      if (this.user && this.user.role === 'admin') {
        this.allUsersFunc = firebase.functions().httpsCallable('users-all')
        const res = await this.allUsersFunc()
        this.users = res.data
      }
    }
  }
}
</script>

<style lang='scss'>
  .users{
    position: relative;
  }
</style>
