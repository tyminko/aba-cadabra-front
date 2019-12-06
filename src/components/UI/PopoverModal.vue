<template>
  <transition name="fade">
    <div v-if="open" class="popover-modal">
      <div v-click-outside="requestClose" class="modal-content-box content-box">
        <header>
          <button class="cancel micro transparent" @click="requestClose">
            <i class="ti-close" />
          </button>
        </header>
        <div class="modal-content">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import clickOutside from 'vue-click-outside'

export default {
  name: 'PopoverModal',
  directives: { clickOutside },
  props: {
    open: Boolean
  },

  data: () => ({
    allowClickOutside: false
  }),

  computed: {},

  watch: {
    open (value) {
      this.setAllowClickOutside()
    }
  },

  mounted () {
    this.setAllowClickOutside()
  },

  methods: {
    requestClose () {
      if (this.open && this.allowClickOutside) {
        this.$emit('close')
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

<style lang="scss">
  // @import "../../../assets/styles/vars";
  // @import "../../../assets/styles/mixins";
  $basic-size: 3.8rem;
  $basic-padding: 1rem;
  $content-min-width: 5rem;
  $tag-inline-height: 3.8rem;

  .popover-modal {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    background: rgba(0, 0, 0, 0.5);

    .modal-content-box {
      position: relative;
      min-width: $basic-size * 2;
      min-height: $basic-size * 2;
      max-width: 100%;
      max-height: 100%;
      margin: 1rem;

      border-radius: 3px;
      overflow: hidden;

      background: #fff;

      transition: width 0.2s, height 0.2s;

      header {
        background: transparent !important;
      }

      .modal-content {
        padding: 0 $basic-padding;

        max-height: calc(100vh - #{($tag-inline-height + 2 * $basic-padding)});
        overflow-y: auto;
      }
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
