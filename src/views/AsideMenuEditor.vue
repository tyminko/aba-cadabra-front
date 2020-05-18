<template>
  <div class="aside-menu">
    <draggable-content
      v-model="menuList"
      filter=".not-sortable">
      <div
        v-for="item in menuList"
        :key="item.id"
        class="menu-item flex items-center text-lg h-base bg-white pr-base"
        :class="{'not-sortable': item.status!=='public'}">
        <div
          class="handle flex items-center"
          :class="{'opacity-0': item.status!=='public'}">
          <i class="material-icons text-gray-300 cursor-move">drag_indicator</i>
        </div>
        <router-link
          :to="{name: item.routeName, params: {id: item.id}}"
          class="px-sm"
          :class="{off: item.status==='draft', 'text-pink-700': item.status==='internal'}">
          {{item.title}}
        </router-link>
        <button
          v-if="adminOrEditor"
          class="edit-button compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
          @click="openEditor(item.routeName, item)">
          <i class="material-icons text-base cursor-pointer">edit</i>
        </button>
      </div>
    </draggable-content>
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

export default {
  name: 'AsideMenuEditor',
  components: { Popper, DraggableContent },
  props: {},

  data: () => ({
    publicMenuItems: {},
    programmes: {},
    pages: {},
    unsubscribe: {},
    combinedMenuList: []
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    menuList: {
      get () {
        const menu = this.publicMenuItems
        const list = [...Object.values(this.programmes), ...Object.values(this.pages)]
        return list.map(p => {
          const order = p.status === 'internal'
            ? 0
            : p.status === 'public'
              ? parseInt((menu[p.id] || {}).order) + 1 || 9000
              : 10000
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
    }
  },

  created () {
    this.subscribeMenu()
    if (this.user) {
      this.getProgrammesAndPages()
    }
  },

  watch: {
    user () {
      this.getProgrammesAndPages()
    },
    menuList () {
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
      this.updateProgrammes(this.menuList.filter(item => item.routeName === 'programme'))
    },

    subscribeMenu () {
      this.unsubscribe.menu = db.collection('settings')
        .doc('publicMenu')
        .onSnapshot(snap => {
          this.publicMenuItems = (snap.data() || {}).items
          this.updateProgrammesInStorage()
        })
    },

    getProgrammesAndPages () {
      this.subscribeCollection('programmes', this.programmes)
      this.subscribeCollection('pages', this.pages)
    },

    subscribeCollection (collectionId, resultContainer) {
      let query = db.collection(collectionId)
      if (!this.adminOrEditor) {
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
                if (data.status !== 'trash') {
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
    .menu-item {
      a {
        text-transform: capitalize;
        &.off {
          @apply text-gray-400 italic;
        }
      }
      .handle:active {
        i { @apply text-aba-blue; }
      }
      .edit-button {
        opacity: 0;
        transition: opacity 0.1s;
        margin-left: auto;
      }
      &:hover {
        .edit-button { opacity: 1 }
      }
    }
    .popper-trigger {
      display: flex;
      width: min-content;
    }
  }
</style>
