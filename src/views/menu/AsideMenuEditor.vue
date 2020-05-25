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
          @open-editor="openEditor(item.type, item)"/>
      </section>
    </smooth-reflow>
<!--    <div class="">-->
<!--      <aside-menu-editor-item-->
<!--        v-for="item in combined"-->
<!--        :key="item.id"-->
<!--        :item="item"-->
<!--        :editable="adminOrEditor"-->
<!--        class="bg-gray-200"-->
<!--        @open-editor="openEditor(item.type, item)"/>-->
<!--    </div>-->
    <popper
      v-if="adminOrEditor"
      placement="right"
      class="">
      <template v-slot:reference="{show}">
        <span
          class="button w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
          :class="{active:show}">
          <i class="material-icons text-xxl cursor-pointer">add</i>
        </span>
      </template>
      <template v-slot:default="{hide}">
        <div class="post-editor-palette">
          <section class="text-sm pb-3 border-b border-aba-blue-semi">
            <a class="block min-h-full cursor-pointer" @click.prevent="openEditor('page')">Add Page</a>
          </section>
          <section class="text-sm pt-3">
            <a class="block min-h-full cursor-pointer" @click.prevent="openEditor('programme')">Add Programme</a>
          </section>
        </div>
      </template>
    </popper>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { db } from '../../lib/firebase'
import DraggableContent from '../components/UI/DraggableContent'
import Popper from '../components/UI/Popper.js.vue'
import AsideMenuEditorItem from './AsideMenuEditorItem'
import SmoothReflow from '../components/UI/SmoothReflow'

export default {
  name: 'AsideMenuEditor',
  components: { SmoothReflow, AsideMenuEditorItem, Popper, DraggableContent },
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
    ...mapState(['user']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },

    combined () { return [...Object.values(this.programmes), ...Object.values(this.pages)] },

    drafts () {
      return this.combined.filter(item => item.status === 'draft')
        .sort((a, b) => {
          if (a.title < b.title) return -1
          if (a.title > b.title) return 1
          return 0
        })
    },

    publicMenuList: {
      get () {
        return [...this.publicMenuItems].sort((a, b) => (a.order + 1 || 1000) - (b.order + 1 || 1000))
      },

      set (newValue) {
        this.publicMenuItems = newValue.map((item, i) => ({ ...item, order: i }))
        this.updateMenuInSettings('public', newValue)
      }
    },

    internalMenuList: {
      get () {
        return [...this.internalMenuItems].sort((a, b) => (a.order + 1 || 1000) - (b.order + 1 || 1000))
      },

      set (newValue) {
        this.internalMenuItems = newValue.map((item, i) => ({ ...item, order: i }))
        this.updateMenuInSettings('internal', newValue)
      }
    }
  },

  created () {
    this.subscribeMenu('publicMenu')
    this.subscribeMenu('internalMenu')
    if (this.user) {
      this.getProgrammesAndPages()
    }
  },

  watch: {
    user () { this.getProgrammesAndPages() },
    publicMenuList () { this.$emit('updated') },
    internalMenuList () { this.$emit('updated') },
    drafts () { this.$emit('updated') }
  },

  beforeDestroy () {
    Object.values(this.unsubscribe).forEach(u => {
      if (typeof u === 'function') u()
    })
  },

  methods: {
    ...mapActions(['showEditor', 'updateProgrammes']),
    /**
     * @param {string} type
     * @param {object=} item
     */
    async openEditor (type, item) {
      item = await this.prepareItemForEditor(type, item)
      this.showEditor({
        type,
        value: item,
        onSaved: () => {
          this.$emit('updated')
        }
      })
    },

    async prepareItemForEditor (type, item) {
      const id = (item || {}).id
      if (!id) return null
      if (type === 'programme') {
        if (this.programmes.hasOwnProperty(id)) {
          return this.programmes[id]
        } else {
          return db.collection('programmes').doc(id).get()
        }
      } else if (type === 'page') {
        if (this.pages.hasOwnProperty(id)) {
          return this.pages[id]
        } else {
          return db.collection('pages').doc(id).get()
        }
      }
      return null
    },

    updateProgrammesInStorage () {
      this.updateProgrammes([
        ...this.publicMenuList.filter(item => item.type === 'programme'),
        ...this.internalMenuList.filter(item => item.type === 'programme'),
        ...this.drafts.filter(item => item.type === 'programme')
      ])
    },

    getProgrammesAndPages () {
      this.subscribeCollection('programmes', this.programmes)
      this.subscribeCollection('pages', this.pages)
    },

    subscribeMenu (menuName) {
      this.unsubscribe[menuName] = db.collection('settings')
        .doc(menuName)
        .onSnapshot(snap => {
          this[menuName + 'Items'] = Object.entries((snap.data() || {}).items || {}).map(([id, item]) => ({ ...item, id }))
          this.updateProgrammesInStorage()
        })
    },

    subscribeCollection (collectionId, resultContainer) {
      let query = db.collection(collectionId)
      if (!this.user) {
        query = query.where('status', '==', 'public')
      }
      if (this.unsubscribe.hasOwnProperty(collectionId) &&
        typeof this.unsubscribe[collectionId] === 'function') {
        this.unsubscribe[collectionId]()
      }
      this.unsubscribe[collectionId] = query.onSnapshot({
        next: querySnapshot => {
          const itemType = this.routeNameFromCollectionId(collectionId)
          querySnapshot.docChanges().forEach(docChange => {
            const doc = docChange.doc
            switch (docChange.type) {
              case 'added':
              case 'modified':
                const data = doc.data()
                if (this.shouldIncludeStatus(data.status)) {
                  this.$set(resultContainer, doc.id, {
                    ...data,
                    id: doc.id,
                    type: itemType
                  })
                } else {
                  this.$delete(resultContainer, doc.id)
                }
                break
              case 'removed':
                this.$delete(resultContainer, doc.id)
            }
          })
          if (collectionId === 'programmes') this.updateProgrammesInStorage()
        },
        error: err => {
          console.error(`Subscribe to ${collectionId}:`, err)
        }
      })
    },

    updateMenuInSettings (status, newValue) {
      db.collection('settings').doc(status + 'Menu').set({
        items: newValue.reduce((res, item, i) => {
          res[item.id] = { ...item, order: i }
          return res
        }, {})
      })
    },

    shouldIncludeStatus (status) {
      switch (status) {
        case 'trash':
          return false
        case 'draft':
          return this.adminOrEditor
        case 'internal':
          return !!this.user
        default :
          return true
      }
    },

    routeNameFromCollectionId (collectionId) {
      switch (collectionId) {
        case 'programmes': return 'programme'
        case 'pages': return 'page'
        default: return collectionId
      }
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
