<template>
  <div class="aside-menu">
    <template v-for="(sectionList, id) in sections">
      <section v-if="sectionList.length" :key="id" :class="[id]">
        <div
          v-for="item in sectionList"
          :key="item.id"
          class="menu-item flex items-center text-lg h-base bg-white px-base"
          :class="[item.status]">
          <router-link
            :to="{name: item.type, params: {id: item.id}}"
            class="px-sm">
            {{item.title}}
          </router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { db } from '../../lib/firebase'

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
    sections () {
      return { internal: this.internalList, public: this.publicList }
    },

    internalList () {
      return Object.entries(this.menuItems.internal || {})
        .map(([id, item]) => ({ ...item, id, status: 'internal' }))
        .sort((a, b) => a.order - b.order)
    },
    publicList () {
      return Object.entries(this.menuItems.public || {})
        .map(([id, item]) => ({ ...item, id }))
        .sort((a, b) => a.order - b.order)
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
<!--suppress CssInvalidAtRule -->
<style lang="scss">

</style>
