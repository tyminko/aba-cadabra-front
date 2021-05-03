<template>
  <div class="text-editor">
    <label class="px-label transition-opacity m-0" :class="{focus:focused}">
      <span v-if="labelText" class="label" :class="labelVisible ? 'opacity-1' : 'opacity-0'">
        {{labelText}}
      </span>
    </label>
    <editor-menu-bar
      ref="menu-host"
      :editor="editor"
      v-slot="{ commands, isActive, getMarkAttrs, menu }">
      <div
        ref="menu"
        class="menu-bar">
        <div ref="menu-content" :id="menuId" class="menu flex items-center">
          <button :class="{ active: isActive.bold() }" @click.prevent="commands.bold">
            <i class="material-icons">format_bold</i>
          </button>
          <button :class="{ active: isActive.italic() }" @click.prevent="commands.italic">
            <i class="material-icons">format_italic</i>
          </button>

          <form
            v-if="linkMenuIsActive"
            class="flex items-center pl-sm overflow-hidden bg-milk"
            @submit.prevent="setLinkUrl(commands.link, linkUrl)">
            <input-flex
              ref="linkInput"
              v-model="linkUrl"
              placeholder="Add Link"
              class="bg-transparent text-sm italic placeholder-gray-300 truncate"
              comfort-zone="5"
              @keydown.esc="hideLinkMenu"/>
            <button class="compact" @click.prevent="setLinkUrl(commands.link, linkUrl)">
              <i class="material-icons">done</i>
            </button>
          </form>
          <button v-else :class="{ active: isActive.link() }" @click.prevent="showLinkMenu(getMarkAttrs('link'))">
            <i class="material-icons">link</i>
          </button>

          <template v-if="isActive.link()">
            <button @click.prevent="setLinkUrl(commands.link, null)">
              <i class="material-icons">link_off</i>
            </button>
            <button @click.prevent="goToLink(getMarkAttrs('link'))">
              <i class="material-icons">launch</i>
            </button>
          </template>
        </div>
      </div>
    </editor-menu-bar>
    <editor-content
      ref="editor-content"
      :editor="editor"
      class="text-area min-h-base py-base"
      :class="{focus:focused}"/>
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  Bold, Italic, Link, History, Placeholder,
  Blockquote, OrderedList,
  BulletList } from 'tiptap-extensions'
import simpleID from '../../../lib/simpleId'
import InputFlex from './inputs/InputFlex'
import inputAutoWidth from 'vue-input-autowidth'
import ClickOutside from 'vue-click-outside'

export default {
  name: 'TextEditor',
  directives: { ClickOutside, inputAutoWidth },
  components: { EditorContent, EditorMenuBar, InputFlex },
  props: {
    value: String,
    label: String,
    placeholder: String,
    error: { type: [String, Boolean], default: false }
  },

  data: () => ({
    linkUrl: null,
    linkMenuIsActive: false,
    editor: null,
    emitAfterOnUpdate: false,
    menuId: simpleID(),
    focused: false
  }),

  computed: {
    labelText () {
      return this.label || this.placeholder || ''
    },

    placeholderText () {
      return this.placeholder || this.label || ''
    },
    labelVisible () {
      return !!this.value
    }
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
        new History(),
        new Placeholder({
          showOnlyCurrent: false,
          emptyNodeText: node => {
            return 'Write something'
          }
        }),
        new Blockquote(),
        new OrderedList(),
        new BulletList()
      ]
    })

    this.editor.on('update', ({ getHTML }) => {
      this.emitAfterOnUpdate = true
      this.$emit('input', getHTML())
    })

    this.editor.on('focus', () => {
      this.focused = true
      // if (!this.$refs['editor-content']) return
      // this.$refs['editor-content'].$el.classList.add('focus')
      this.$emit('focus')
    })

    this.editor.on('blur', () => {
      this.focused = false
      // if (!this.$refs['editor-content']) return
      // this.$refs['editor-content'].$el.classList.remove('focus')
      this.$emit('blur')
    })
  },

  mounted () {
    window.addEventListener('keydown', this.onEsc)
    // this.getScrollableParents(this.$refs['menu'].$el, []).forEach(el => {
    //   el.addEventListener('scroll', this.hideMenu)
    // })
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
  .px-label.focus { @apply text-aba-blue; }
  .text-area.focus {
    @apply text-aba-blue-dark;
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
    .menu-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      /*width: max-content;*/
      @apply bg-milk;
    }
    .menu {
      @apply py-xs pt-base pr-base bg-milk;
      button {
        @apply w-1/2base h-1/2base border-r border-gray-400 rounded-none bg-transparent;
        &:last-child {
          border: none;
        }
        i {
          @apply  text-xl text-gray-900;
        }
        &.active {
          i {
            @apply  text-xl text-aba-blue;
          }
        }
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

  .editor *.is-empty:nth-child(1)::before,
  .editor *.is-empty:nth-child(2)::before {
    content: attr(data-empty-text);
    @apply text-gray-400 font-thin italic capitalize;
    float: left;
    pointer-events: none;
    height: 0;
  }
</style>
