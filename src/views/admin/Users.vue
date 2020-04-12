<template>
  <div class="users">
    <div class="flex flex-wrap p-base">
      <div
        v-for="user in users"
        :key="user.uid"
        class="user-card m-sm p-sm w-64"
        @click="openEditor(user)">
        <div class="photo">
          <img v-if="user.photoURL" :src="user.photoURL">
        </div>
        <h2 class="name">{{user.displayName || user.email}}</h2>
        <div class="email">{{user.email}}</div>
        <div class="phone desc">Phone: {{user.phoneNumber}}</div>
        <div class="role desc">Role: {{user.role}}</div>
      </div>
<!--      <v-progress-circular v-if="processing" indeterminate />-->
    </div>
<!--    <editor :open="showEditor" :value="selectedUser" type="profile" @close="showEditor = false"/>-->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import * as users from '../../lib/users'
// import Editor from '../editor/Editor'
// import { db } from '../../lib/firebase'

export default {
  name: 'Users',
  // components: { Editor },

  data: () => ({
    users: [],
    selectedUser: null,
    allUsersFunc: null,
    nextPageToken: '',
    viewportIsSmall: false,
    processing: false
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
    ...mapActions(['showEditor']),
    async getUsers () {
      if (this.user && this.user.role === 'admin') {
        this.processing = true
        this.users = await users.getAll()
        this.processing = false
      } else {
        this.users = []
      }
    },

    updateUserInList (userData) {
      if (!userData.uid) return
      const index = this.users.findIndex(u => u.uid === userData.uid)
      if (index > -1) {
        this.$set(this.users, index, { ...userData })
      } else {
        this.users.unshift(userData)
      }
    },

    openEditor (user) {
      this.selectedUser = user
      this.showEditor({
        type: 'profile',
        value: user,
        onSaved: ({ uid, data }) => {
          if (!data.displayName) return
          const index = this.users.findIndex(u => u.uid === user.uid)
          if (index > -1) this.$set(this.users, index, { ...user, displayName: data.displayName })
        }
      })
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
