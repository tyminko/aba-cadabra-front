<template>
  <transition name="fade">
    <div v-if="open"
         class="popover-modal">
      <div class="modal-shadow" @click="requestClose"/>
      <div class="w-full h-full bg-white rounded-sm">
        <header class="flex h-base items-center">
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
import { scrollGuard } from '../../../lib/prvent-scroll-behind'
import clickOutside from 'vue-click-outside'

export default {
  name: 'PopoverModal',
  directives: { clickOutside },
  props: {
    open: { type: Boolean, required: true }
  },

  data: () => ({
    allowClickOutside: true
  }),

  computed: {},

  watch: {
    open (value) {
      this.guardScrollOnOpenClose()
      this.setAllowClickOutside()
    }
  },

  created () {
    scrollGuard.init()
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        this.requestClose()
      }
    })
  },

  mounted () {
    this.guardScrollOnOpenClose()
    this.setAllowClickOutside()
  },

  methods: {
    requestClose () {
      if (this.open && this.allowClickOutside) {
        this.$emit('close')
      }
    },

    guardScrollOnOpenClose () {
      if (this.open) {
        scrollGuard.onShowModal()
      } else {
        scrollGuard.onCloseModal()
      }
    },

    setAllowClickOutside () {
      if (this.open) {
        setTimeout(() => { this.allowClickOutside = true }, 100)
      } else {
        this.allowClickOutside = false
      }
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  // @import "../../../assets/styles/vars";
  // @import "../../../assets/styles/mixins";
  $basic-size: 3.8rem;
  $basic-padding: 1rem;
  $content-min-width: 5rem;
  $tag-inline-height: 3.8rem;

  .popover-modal {
    position: fixed;
    z-index: 9999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .modal-shadow {
      content: '';
      position: fixed;
      height: calc(100vh + 10px);
      width: calc(100vw + 10px);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.5);
      z-index: -1;
    }

    .modal-content-box {
      position: relative;
      width: 100%;
      max-width: min-content;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s;
  }

  /* .fade-leave-active below version 2.1.8 */
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
