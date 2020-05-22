<template>
  <div class="aside-menu">
    <draggable-content
      v-model="internalMenuList"
      :options="{group: 'internal'}"
      class="border-dashed border-gray-300"
      :class="{'border-b': publicMenuList.length}">
      <aside-menu-editor-item
        v-for="item in internalMenuList"
        :key="item.id"
        :item="item"
        :editable="adminOrEditor"
        @open-editor="openEditor(item.routeName, item)"/>
    </draggable-content>
    <draggable-content
      v-model="publicMenuList"
      :options="{group: 'public'}"
      class="border-dashed border-gray-300"
      :class="{'border-b': drafts.length}">
      <aside-menu-editor-item
        v-for="item in publicMenuList"
        :key="item.id"
        :item="item"
        :editable="adminOrEditor"
        @open-editor="openEditor(item.routeName, item)"/>
    </draggable-content>
    <aside-menu-editor-item
      v-for="item in drafts"
      :key="item.id"
      :item="item"
      :editable="adminOrEditor"
      @open-editor="openEditor(item.routeName, item)"/>
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
import { db } from '../lib/firebase'
import DraggableContent from './components/UI/DraggableContent'
import Popper from './components/UI/Popper.js'
import AsideMenuEditorItem from './AsideMenuEditorItem'

export default {
  name: 'AsideMenuEditor',
  components: { AsideMenuEditorItem, Popper, DraggableContent },
  props: {},

  data: () => ({
    publicMenuItems: {},
    internalMenuItems: {},
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
        const list = this.combined.filter(item => item.status === 'public')
        return list.map(p => {
          const order = parseInt((this.publicMenuItems[p.id] || {}).order) + 1 || 9000
          return { ...p, order }
        }).sort((a, b) => a.order - b.order)
      },

      set (newValue) {
        this.publicMenuItems = newValue.reduce((res, item, i) => ({ ...res, [item.id]: { ...item, order: i } }), {})
        db.collection('settings').doc('publicMenu').set({
          items: newValue
            .filter(item => item.status === 'public')
            .reduce((res, item, i) => {
              res[item.id] = { title: item.title, order: i }
              return res
            }, {})
        })
      }
    },

    internalMenuList: {
      get () {
        const internalMenu = this.internalMenuItems
        const list = this.combined.filter(item => item.status === 'internal')
        return list.map(p => {
          const order = parseInt((internalMenu[p.id] || {}).order) + 1 || 9000
          return { ...p, order }
        }).sort((a, b) => a.order - b.order)
      },

      set (newValue) {
        this.internalMenuItems = newValue.reduce((res, item, i) => ({ ...res, [item.id]: { ...item, order: i } }), {})
        db.collection('settings').doc('internalMenu').set({
          items: newValue
            .filter(item => item.status === 'internal')
            .reduce((res, item, i) => {
              res[item.id] = { title: item.title, order: i }
              return res
            }, {})
        })
      }
    }
  },

  created () {
    this.subscribePublicMenu()
    if (this.user) {
      this.getProgrammesAndPages()
    }
  },

  watch: {
    user () {
      this.getProgrammesAndPages()
    },
    publicMenuList () {
      this.$emit('updated')
    }
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
    openEditor (type, item) {
      this.showEditor({
        type,
        value: item,
        onSaved: () => {
          this.$emit('updated')
        }
      })
    },

    updateProgrammesInStorage () {
      this.updateProgrammes([
        ...this.publicMenuList.filter(item => item.routeName === 'programme'),
        ...this.internalMenuList.filter(item => item.routeName === 'programme'),
        ...this.drafts.filter(item => item.routeName === 'programme')
      ])
    },

    subscribePublicMenu () {
      this.unsubscribe.menu = db.collection('settings')
        .doc('publicMenu')
        .onSnapshot(snap => {
          this.publicMenuItems = (snap.data() || {}).items
          this.updateProgrammesInStorage()
        })
    },

    subscribeInternalMenu () {
      this.unsubscribe.internalMenu = db.collection('settings')
        .doc('internalMenu')
        .onSnapshot(snap => {
          this.internalMenuItems = (snap.data() || {}).items
          this.updateProgrammesInStorage()
        })
    },

    getProgrammesAndPages () {
      this.subscribeCollection('programmes', this.programmes)
      this.subscribeCollection('pages', this.pages)
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
                    routeName: this.routeNameFromCollectionId(collectionId)
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
  @import "../styles/vars";
  #app .aside-menu {
  }
</style>
