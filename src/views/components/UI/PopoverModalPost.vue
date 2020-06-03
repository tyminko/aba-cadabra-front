<template>
  <transition name="fade">
    <div v-if="open"
         class="popover-modal modal-post">
      <div class="modal-shadow" @click="requestClose"/>
      <div class="content-box bg-white rounded-sm">
        <header class="flex h-base items-center pl-base">
          <slot name="header" />
          <button class="w-base h-base ml-auto" @click="requestClose">
            <i class="material-icons">close</i>
          </button>
        </header>
        <slot/>
      </div>
    </div>
  </transition>
</template>

<script>
import { gotoBookmark } from '../../../lib/bookmarks'
import { bodyScrollGuard } from '../../../lib/control-body-scroll'
import clickOutside from 'vue-click-outside'

export default {
  name: 'PopoverModalPost',
  directives: { clickOutside },
  props: {
    bookmark: null
  },
  data: () => ({
    allowClickOutside: true,
    open: true
  }),

  created () {
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        this.$emit('esc', e)
        this.requestClose()
      }
    })
  },

  mounted () {
    this.setBodyScroll(this.open)
    this.setAllowClickOutside()
  },

  watch: {
    open (value) {
      this.setBodyScroll(value)
      this.setAllowClickOutside()
    }
  },

  methods: {
    requestClose () {
      if (this.open && this.allowClickOutside) {
        this.open = false
        setTimeout(() => {
          if (this.bookmark) {
            gotoBookmark(this.bookmark)
          } else {
            this.$router.push('/')
          }
          this.$emit('close')
        }, 500)
      }
    },

    setBodyScroll (freeze) {
      if (freeze) {
        bodyScrollGuard.freezeBodyScroll()
      } else {
        bodyScrollGuard.releaseBodyScroll()
      }
    },

    releaseBgScroll () {
      this.setBodyScroll(false)
    },

    setAllowClickOutside () {
      if (this.open) {
        setTimeout(() => { this.allowClickOutside = true }, 100)
      } else {
        this.allowClickOutside = false
      }
    }
  },

  beforeDestroy () {
    bodyScrollGuard.releaseBodyScroll()
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../../styles/vars";

  .popover-modal.modal-post {
    width: $max-width-text-block + $base-size + $max-width-sidebar;
    max-width: calc(100vw - #{$base-padding} * 2);
    .content-box {
      position: relative;
      height: calc(100vh - (#{$base-padding} - #{$border-thick-w}) * 2);
      border: $border-thick-w solid #ebeceb;

      & > header {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1000;
        button {
          border-radius: 50%;
          background: white;
        }
      }
    }
    .modal-shadow {
      background: rgba(215, 215, 215, 0.5);
    }
  }
</style>
