<template>
  <div class="users h-full flex items-center justify-center">
    <div class="flex flex-wrap p-base">
      <div
        v-for="user in users"
        :key="user.uid"
        class="user-card m-sm p-sm w-64"
        @click="openEditor(user)">
        <div class="photo">
          <img v-if="user.photoURL" :src="user.photoURL">
        </div>
        <h2 class="name truncate">{{user.displayName || user.email}}</h2>
        <div class="email truncate">{{user.email}}</div>
        <div class="role desc" :class="[user.role]">{{user.role}}</div>
      </div>
    </div>
    <template v-if="!users.length">
      <div v-if="processing" class="text-aba-blue">Loading...</div>
      <div v-else>Nothing there</div>
    </template>
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
        const ulist = await users.getAll()
        this.users = ulist.sort((a, b) => {
          if (a.displayName < b.displayName) return -1
          if (a.displayName > b.displayName) return 1
          return 0
        })
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
          const index = this.users.findIndex(u => u.uid === uid)
          if (index > -1) this.$set(this.users, index, { ...user, displayName: data.displayName, email: data.email, role: data.role })
        }
      })
    },

    isViewportSmall () {
      this.viewportIsSmall = window.innerWidth < 600 || window.innerHeight < 400
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang='scss'>
  .users{
    .admin, .editor {
      @apply bg-aba-blue text-white px-sm;
      width: min-content;
      &.editor {
        @apply bg-aba-blue-semi;
      }
    }
    .visitor {
      @apply text-gray-400 italic;
    }
  }
</style>
