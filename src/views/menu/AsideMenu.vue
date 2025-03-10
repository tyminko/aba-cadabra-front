<template>
  <div class="aside-menu" :class="{zero: loading}">
    <smooth-reflow class="member-header">
      <header v-if="adminOrEditor" class="flex justify-end">
        <button :class="{compact:!editMenu}" @click="editMenu = !editMenu">
          <i v-if="!editMenu" class="material-icons text-base">edit</i>
          <span v-else>Done</span>
        </button>
      </header>
    </smooth-reflow>
    <smooth-reflow class="menu-container">
      <aside-menu-editor ref="editor" v-if="editMenu && adminOrEditor" @updated="emitRefresh"/>
      <aside-menu-public v-else @updated="emitRefresh"/>
    </smooth-reflow>
    <footer v-if="editMenu && adminOrEditor" class="flex-shrink-0 h-3/4base flex items-center">
      <popper
        v-if="adminOrEditor"
        placement="right">
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
    </footer>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import AsideMenuEditor from './AsideMenuEditor'
import AsideMenuPublic from './AsideMenuPublic'
import SmoothReflow from '../components/UI/SmoothReflow'
import Popper from '../components/UI/Popper.js'

export default {
  name: 'AsideMenu',
  components: { Popper, SmoothReflow, AsideMenuPublic, AsideMenuEditor },

  data: () => ({
    loading: true,
    editMenu: false
  }),

  computed: {
    ...mapState(['requestToLogin', 'user', 'editorToOpen', 'contentLoaded']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  watch: {
    contentLoaded () {
      setTimeout(() => {
        this.loading = false
        this.$emit('refresh')
      }, 1000)
    },
    editMenu () {
      this.emitRefresh ()
    }
  },

  methods: {
    ...mapActions(['showEditor']),
    /**
     * @param {string} type
     * @param {object=} item
     */
    async openEditor(type, item) {
      if (!this.$refs.editor) return
      item = item ? await this.$refs.editor.prepareItemForEditor(item) : null
      this.showEditor({
        type,
        value: item,
        onSaved: () => {
          this.emitRefresh ()
        }
      })
    },
    emitRefresh () { this.$nextTick(() => this.$emit('refresh')) }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  #app .aside-menu {
    display: flex;
    flex-flow: column;
    max-height: calc(100vh - #{$base-size});

    &.zero {
      width: 0;
    }

    .menu-item {
      @apply px-base;
      &.internal {
        @apply bg-gray-100;
      }
    }
    .menu-container {
      overflow: auto;
    }
  }
</style>
