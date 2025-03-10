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

    internalList () {
      return Object.entries(this.menu.internal || {})
        .map(([id, item]) => ({ ...item, id, status: 'internal' }))
        .sort((a, b) => a.order - b.order)
    },

    publicList () {
      const menu = Object.entries(this.menu.public || {})
        .map(([id, item]) => ({ ...item, id }))
        .sort((a, b) => a.order - b.order)
      return [...menu, {
        type: 'subscribe',
        id: 'subscribe',
        title: 'Subscribe'
      }]
    }
  },

  watch: {
    user () {
      this.updateMenuSubscription ()
    },
    menu () {
      this.$emit('updated')
    }
  },

  created () {
    this.updateMenuSubscription ()
  },

  methods: {
    ...mapActions(['updateMenuSubscription'])
  }
}
</script>
<!--suppress CssInvalidAtRule -->
<style lang="scss">

</style>
