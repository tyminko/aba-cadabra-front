<template>
  <div class="aside-menu-editor">
    <smooth-reflow>
      <section v-if="internalMenuList.length" class="bg-gray-100">
        <header>Internal</header>
        <draggable-content
          v-model="internalMenuList"
          :options="{group: 'internal'}">
          <aside-menu-editor-item
            v-for="item in internalMenuList"
            :key="item.id"
            :item="item"
            :editable="adminOrEditor"
            class="bg-gray-100"
            status="internal"
            @open-editor="openEditor(item.type, item)"/>
        </draggable-content>
      </section>
    </smooth-reflow>
    <smooth-reflow>
      <section v-if="publicMenuList.length">
        <header>Public</header>
        <draggable-content
          v-model="publicMenuList"
          :options="{group: 'public'}">
          <aside-menu-editor-item
            v-for="item in publicMenuList"
            :key="item.id"
            :item="item"
            :editable="adminOrEditor"
            status="public"
            @open-editor="openEditor(item.type, item)"/>
        </draggable-content>
      </section>
    </smooth-reflow>
    <smooth-reflow>
      <section v-if="drafts.length">
        <header>Drafts</header>
        <aside-menu-editor-item
          v-for="item in drafts"
          :key="item.id"
          :item="item"
          :editable="adminOrEditor"
          status="draft"
          @open-editor="openEditor(item.type, item)"/>
      </section>
    </smooth-reflow>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { db } from '../../lib/firebase'
import DraggableContent from '../components/UI/DraggableContent'
import AsideMenuEditorItem from './AsideMenuEditorItem'
import SmoothReflow from '../components/UI/SmoothReflow'

export default {
  name: 'AsideMenuEditor',
  components: { SmoothReflow, AsideMenuEditorItem, DraggableContent },
  props: {},

  data: () => ({
    publicMenuItems: [],
    publicMenuItemsSorted: [],
    internalMenuItems: [],
    programmes: {},
    pages: {},
    unsubscribe: {},
    combinedMenuList: []
  }),

  computed: {
    ...mapState(['user', 'menu']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },

    drafts () {
      return Object.values((this.menu || {}).drafts || {})
        .sort((a, b) => {
          if (a.title < b.title) return -1
          if (a.title > b.title) return 1
          return 0
        })
    },

    publicMenuList: {
      get () { return this.publicMenuItems },
      set (newValue) {
        this.publicMenuItems = newValue.map((item, i) => ({ ...item, order: i }))
        this.updateMenuInSettings('public', newValue)
      }
    },

    internalMenuList: {
      get () { return this.internalMenuItems },
      set (newValue) {
        this.internalMenuItems = newValue.map((item, i) => ({ ...item, order: i }))
        this.updateMenuInSettings('internal', newValue)
      }
    }
  },

  created () {
    this.updateMenuSubscription()
    this.publicMenuItems = this.objectToOrderedList((this.menu || {}).public || {})
    this.internalMenuItems = this.objectToOrderedList((this.menu || {}).internal || {})
  },

  watch: {
    user () { this.updateMenuSubscription() },
    menu () {
      this.publicMenuItems = this.objectToOrderedList((this.menu || {}).public || {})
      this.internalMenuItems = this.objectToOrderedList((this.menu || {}).internal || {})
    },
    publicMenuList () { this.$emit('updated') },
    internalMenuList () { this.$emit('updated') },
    drafts () { this.$emit('updated') }
  },

  methods: {
    ...mapActions(['showEditor', 'updateMenuSubscription']),
    /**
     * @param {string} type
     * @param {object=} item
     */
    async openEditor (type, item) {
      item = item ? await this.prepareItemForEditor(item) : null
      this.showEditor({
        type,
        value: item,
        onSaved: () => {
          this.$emit('updated')
        }
      })
    },

    objectToOrderedList (obj) {
      return Object.values(obj).sort((a, b) => (a.order + 1 || 1000) - (b.order + 1 || 1000))
    },

    async prepareItemForEditor (item) {
      const { id, type } = (item || {})
      if (!id || !type) return null
      const collectionId = type + 's'
      return db.collection(collectionId).doc(id).get().then(doc => {
        return ({ ...doc.data(), id: doc.id })
      })
    },

    updateMenuInSettings (status, newValue) {
      db.collection('settings').doc(status + 'Menu').set({
        items: newValue.reduce((res, item, i) => {
          res[item.id] = { ...item, order: i }
          return res
        }, {})
      })
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  #app .aside-menu-editor {
    section {
      @apply mb-sm;
      header {
        @apply px-base py-sm text-sm text-black;
      }
      .menu-item {
        @apply pl-sm pr-0;
      }
    }
  }
</style>
