<template>
  <div class="aside-menu">
    <div
      v-for="item in menuList"
      :key="item.id"
      class="menu-item flex items-center text-lg h-base bg-white pr-base">
      <router-link
        :to="{name: item.type, params: {id: item.id}}"
        class="px-sm"
        :class="[item.status]">
        {{item.title}}
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { db } from '../lib/firebase'

export default {
  name: 'AsideMenuPublic',
  props: {},

  data: () => ({
    publicMenuItems: {},
    internalMenuItems: {},
    menuItems: {},
    unsubscribe: {}
  }),

  computed: {
    ...mapState(['user']),
    menuList () {
      return [
        ...Object.entries(this.menuItems.internal || {})
          .map(([id, item]) => ({ ...item, id, status: 'internal' }))
          .sort((a, b) => a.order - b.order),
        ...Object.entries(this.menuItems.public || {})
          .map(([id, item]) => ({ ...item, id }))
          .sort((a, b) => a.order - b.order)
      ]
    }
  },

  watch: {
    user () {
      if (this.user) {
        this.subscribeInternalMenu()
      } else {
        this.unsubscribeMenu('internal')
      }
    }
  },

  created () {
    this.subscribeMenus()
  },

  beforeDestroy () {
    this.unsubscribeMenus()
  },

  methods: {
    subscribeMenus () {
      this.subscribePublicMenu()
      this.subscribeInternalMenu()
    },

    subscribePublicMenu () {
      this.unsubscribe.menu = db.collection('settings')
        .doc('publicMenu')
        .onSnapshot(snap => {
          this.$set(this.menuItems, 'public', (snap.data() || {}).items)
          this.$emit('updated')
        })
    },

    subscribeInternalMenu () {
      if (!this.user) return
      this.unsubscribe.internalmenu = db.collection('settings')
        .doc('internalMenu')
        .onSnapshot(snap => {
          this.$set(this.menuItems, 'internal', (snap.data() || {}).items)
          this.$emit('updated')
        })
    },

    unsubscribeMenus () {
      Object.values(this.unsubscribe).forEach(u => {
        if (typeof u === 'function') u()
      })
    },
    unsubscribeMenu (name) {
      if (typeof this.unsubscribe[name] === 'function') this.unsubscribe[name]()
      this.$delete(this.menuItems, name)
      this.$emit('updated')
    }
  }
}
</script>
