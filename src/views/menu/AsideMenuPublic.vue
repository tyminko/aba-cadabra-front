<template>
  <div class="aside-menu-p">
    <template v-for="(sectionList, id) in sections">
      <section v-if="sectionList.length" :key="id" :class="[id]">
        <div
          v-for="item in sectionList"
          :key="item.id"
          class="menu-item flex items-center text-lg h-base px-base"
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
import { mapActions, mapState } from 'vuex'

export default {
  name: 'AsideMenuPublic',
  computed: {
    ...mapState(['user', 'menu']),
    sections () {
      return { internal: this.internalList, public: this.publicList }
    },

    // Ensure we always have a menu object
    safeMenu () {
      return this.menu || { public: {}, internal: {} }
    },

    internalList () {
      return Object.entries(this.menu.internal || {})
        .map(([id, item]) => ({ ...item, id, status: 'internal' }))
        .sort((a, b) => a.order - b.order)
    },

    publicList () {
      // Always return at least the Blogs item, regardless of Firebase data
      const blogsItem = {
        type: 'resident-blogs',
        id: 'resident-blogs',
        title: 'Blogs',
        order: 1
      }

      // Try to get Firebase menu items
      let firebaseItems = []
      if (this.menu && this.menu.public) {
        firebaseItems = Object.entries(this.menu.public)
          .map(([id, item]) => ({ ...item, id }))
          .sort((a, b) => a.order - b.order)
      }

      // Add Subscribe
      const subscribeItem = {
        type: 'subscribe',
        id: 'subscribe',
        title: 'Subscribe',
        order: 999
      }

      return [blogsItem, ...firebaseItems, subscribeItem]
    }
  },

  watch: {
    user () {
      this.updateMenuSubscription()
    },
    menu () {
      console.log('Menu data changed:', this.menu)
      console.log('Public list updated:', this.publicList)
      this.$emit('updated')
    }
  },

  created () {
    this.updateMenuSubscription()
  },

  mounted () {
    console.log('AsideMenuPublic mounted, menu state:', this.menu)
    console.log('Public list computed:', this.publicList)
    console.log('Menu public data:', this.menu && this.menu.public)
  },

  methods: {
    ...mapActions(['updateMenuSubscription'])
  }
}
</script>
<!--suppress CssInvalidAtRule -->
<style lang="scss">

</style>
