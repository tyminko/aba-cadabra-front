<template>
  <transition name="fade">
    <div v-if="open"
         class="popover-modal modal-post">
      <div class="modal-shadow" @click="close"/>
      <div class="content-box bg-white rounded-sm">
        <header class="flex h-base items-center pl-base">
          <button v-if="allowCoBack" class="w-base h-base ml-auto" @click="goBack">
            <i class="material-icons">arrow_back</i>
          </button>
          <slot name="header" />
          <button class="w-base h-base ml-auto" @click="close">
            <i class="material-icons">close</i>
          </button>
        </header>
        <slot/>
      </div>
    </div>
  </transition>
</template>

<script>
import { getRootPath } from '../../../lib/bookmarks'
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
    allowCoBack: true,
    open: true
  }),

  created () {
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        this.$emit('esc', e)
        this.close()
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
    goBack () {
      history.back()
    },

    close () {
      if (this.open && this.allowClickOutside) {
        this.open = false
        this.$emit('close')
        setTimeout(() => {
          const rootPath = getRootPath() || '/'
          this.$router.push(rootPath)
        }, 200)
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
      border: $border-thick-w solid #888888;

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
