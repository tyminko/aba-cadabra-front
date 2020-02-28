<template>
  <div class="text-editor transition-opacity">
    <editor-menu-bubble
      ref="menu-host"
      :editor="editor"
      :keep-in-bounds="false"
      v-slot="{ commands, isActive, getMarkAttrs, menu }">
      <popper
        ref="menu"
        :trigger="menu.isActive"
        :arrow-size="8"
        placement="cursor-top"
        boundaries-selector="body"
        :position="convertMenuToPopperPosition(menu)"
        class="menu-bubble">
        <div ref="menu-content" :id="menuId" class="menu flex items-center">
          <button :class="{ active: isActive.bold() }" @click="commands.bold">
            <i class="material-icons text-xl text-gray-100">format_bold</i>
          </button>
          <button :class="{ active: isActive.italic() }" @click="commands.italic">
            <i class="material-icons text-xl text-gray-100">format_italic</i>
          </button>

          <form
            v-if="linkMenuIsActive"
            class="flex items-center pl-sm overflow-hidden"
            @submit.prevent="setLinkUrl(commands.link, linkUrl)">
            <input-flex
              ref="linkInput"
              v-model="linkUrl"
              placeholder="Add Link"
              class="bg-transparent text-sm italic placeholder-gray-300 truncate"
              comfort-zone="5"
              @keydown.esc="hideLinkMenu"/>
            <button @click="setLinkUrl(commands.link, linkUrl)">
              <i class="material-icons text-xl text-gray-100">done</i>
            </button>
          </form>
          <button v-else :class="{ active: isActive.link() }" @click="showLinkMenu(getMarkAttrs('link'))">
            <i class="material-icons">link</i>
          </button>

          <template v-if="isActive.link()">
            <button @click="setLinkUrl(commands.link, null)">
              <i class="material-icons">link_off</i>
            </button>
            <button @click="goToLink(getMarkAttrs('link'))">
              <i class="material-icons">launch</i>
            </button>
          </template>
        </div>
      </popper>
    </editor-menu-bubble>
    <editor-content
      ref="editor-content"
      class="text-area min-h-base py-base"
      :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBubble } from 'tiptap'
import { Bold, Italic, Link, History } from 'tiptap-extensions'
import simpleID from '../../../lib/simpleID'
import InputFlex from './inputs/InputFlex'
import Popper from './Popper.js'
import inputAutoWidth from 'vue-input-autowidth'
import ClickOutside from 'vue-click-outside'

export default {
  name: 'TextEditor',
  directives: { ClickOutside, inputAutoWidth },
  components: { EditorContent, EditorMenuBubble, Popper, InputFlex },
  props: {
    value: String
  },

  data: () => ({
    linkUrl: null,
    linkMenuIsActive: false,
    editor: null,
    emitAfterOnUpdate: false,
    menuId: simpleID()
  }),

  computed: {
  },

  created () {
    this.editor = new Editor({
      content: this.value,
      extensions: [
        new Bold(),
        new Italic(),
        new Link({
          openOnClick: false
        }),
        new History()
      ]
    })

    this.editor.on('update', ({ getHTML }) => {
      this.emitAfterOnUpdate = true
      this.$emit('input', getHTML())
    })

    this.editor.on('focus', () => {
      if (!this.$refs['editor-content']) return
      this.$refs['editor-content'].$el.classList.add('focus')
      this.$emit('focus')
    })

    this.editor.on('blur', () => {
      if (!this.$refs['editor-content']) return
      this.$refs['editor-content'].$el.classList.remove('focus')
      this.$emit('blur')
    })
  },

  mounted () {
    window.addEventListener('keydown', this.onEsc)
    this.getScrollableParents(this.$refs['menu'].$el, []).forEach(el => {
      el.addEventListener('scroll', this.hideMenu)
    })
  },

  watch: {
    value (newValue) {
      if (this.emitAfterOnUpdate) {
        this.emitAfterOnUpdate = false
        return
      }
      if (this.editor) this.editor.setContent(newValue)
    }
  },

  methods: {
    /**
     * @param {Event} e
     */
    onEsc (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (this.$refs['menu-host'] && this.$refs['menu-host'].menu.isActive) {
          e.stopImmediatePropagation()
          this.hideMenu()
          return true
        }
      }
    },

    hideMenu () {
      if (this.$refs['menu-host']) {
        this.hideLinkMenu()
        this.$refs['menu-host'].menu.isActive = false
      }
    },

    showLinkMenu (attrs) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.linkInput.focus()
      })
    },

    hideLinkMenu () {
      this.linkUrl = null
      this.linkMenuIsActive = false
    },

    setLinkUrl (command, url) {
      command({ href: url })
      this.hideLinkMenu()
    },

    goToLink (attrs) {
      window.open(attrs.href)
    },

    convertMenuToPopperPosition ({ left, bottom }) {
      if (this.$refs['editor-content']) {
        const el = this.$refs['editor-content'].$el
        const rect = el.offsetParent.getBoundingClientRect()
        return { x: rect.x + left, y: (rect.bottom - bottom) + 2 }
      }
    },
    /**
     * @param {HTMLElement} el
     * @param {HTMLElement[]=} parents
     * @return {HTMLElement[]}
     */
    getScrollableParents (el, parents = []) {
      const { position, overflow, overflowY, overflowX } = window.getComputedStyle(el)
      if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
        parents = [...parents, el]
      }
      if (position !== 'fixed' && el.parentElement && el.parentElement instanceof Element) {
        parents = this.getScrollableParents(el.parentElement, parents)
      }
      return parents
    }
  },

  beforeDestroy () {
    this.editor.destroy()
    window.removeEventListener('keydown', this.onEsc)
  }
}
</script>

<!--suppress CssInvalidAtRule, CssInvalidFunction -->
<style lang="css">
  .text-area:after {
    content: '';
    display: block;
    width: 100%;
    height: 0;
    border-bottom: 1px solid theme('colors.aba-blue-semi');
    position: sticky;
    transform: translateY(theme('padding.base'));
    bottom: 0;
  }
  .text-area a {
    color: theme('colors.aba-blue');
  }
  .text-area.focus {
    @apply text-aba-blue-dark
  }
  .text-area.focus:after {
    @apply border-aba-blue;
  }
  .text-area.focus a {
    @apply underline;
  }
  .text-area .ProseMirror {
    @apply px-sm leading-normal;
  }
  .text-area .ProseMirror-focused {
    @apply px-sm;
  }
</style>
<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .text-editor {
    .ProseMirror {
      &:focus {
        outline: none;
      }
    }
  }
  .menu-bubble {
    --popper-bg-color: #3e4b78;
    --popper-border-color: #3e4b78;
    --popper-border-width: 1px;

    .popper {
      padding: 0;
      color: #fff;
    }

    .menu {
      @apply py-xs;

      button {
        @apply w-1/2base h-1/2base border-r border-gray-400 rounded-none bg-transparent;
        &:last-child {
          border: none;
        }
        i {
          @apply  text-xl text-gray-100;
        }
      }
    }

  }

  $color-black: #ccc;
  $color-white: #fff;

  .menububble {
    @apply  absolute flex items-center shadow-soft min-w-0 bg-white border-2 border-gray-300 rounded-sm;
    transform: translateX(-50%);
    z-index: 20;
    margin-bottom: 0.5rem;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s, visibility 0.2s;

    &.is-active {
      opacity: 1;
      visibility: visible;
    }

    &__form {
      display: flex;
      align-items: center;
    }

    &__input {
      font: inherit;
      border: none;
      background: transparent;
      color: $color-white;
    }
  }
</style>
