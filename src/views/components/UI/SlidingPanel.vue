<template>
  <div v-click-outside="close" class="sliding-panel-wrap">
    <div class="trigger trigger-wrap">
      <slot name="trigger" :on="toggle" :open="open" />
    </div>
    <div
      ref="panel"
      :class="[`from-${from}`, `align-${align}`, {open}]"
      class="sliding-panel"
      @click.native="toggle">
      <slot />
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside'

export default {
  name: 'SlidingPanel',
  directives: { ClickOutside },
  props: {
    from: { type: String, default: 'top' },
    align: { type: String, default: 'end' },
    margin: { type: Number, default: 0 }
  },

  data: () => ({
    open: false
  }),

  computed: {
  },

  watch: {
    $route () {
      this.close()
    },
    on (value) { this.open = value },
    open (val) {
      this.setTop()
      this.$nextTick(() => {
        this.$emit('stateChanged', this.on)
      })
    }
  },

  mounted () {
    this.open = this.on
    this.setTop()
  },

  methods: {
    close () {
      this.open = false
    },
    toggle () {
      this.open = !this.open
    },
    jumpTop () {
      const panel = this.$refs.panel
      if (!panel) return
      const transition = panel.style.transition
      panel.style.transition = 'none 0s ease 0s'
      this.setTop()
      panel.style.transition = transition
    },
    setTop () {
      const panel = this.$refs.panel
      if (!panel) return
      if (this.open) {
        panel.style.top = 0
      } else {
        panel.style.top = -this.getHeight() + 'px'
      }
    },
    getHeight () {
      /** @type HTMLElement */
      const panel = this.$refs.panel
      if (!panel) return null
      const preDisplay = panel.style.display
      const { display, boxShadow } = window.getComputedStyle(panel)
      const shadow = this.parseShadow(boxShadow)
      const bottomShadow = shadow[1] + shadow[2] + (shadow.length > 3 ? shadow[3] : 0)
      if (display === 'none') panel.style.display = 'block'
      const h = panel.getBoundingClientRect().height + bottomShadow
      if (display === 'none') panel.style.display = preDisplay
      return h
    },
    parseShadow (shadowStr) {
      const sizes = [0, 0, 0, 0]
      if (shadowStr === 'none') return sizes
      shadowStr = shadowStr.replace(/\s?rgba?\(.*\)\s?/, '')
      return shadowStr.split(' ').map(n => parseInt(n))
    }
  }
}
</script>

<style lang="scss">
  @import "../../../styles/vars";

  .sliding-panel-wrap {
    .trigger {
      position: relative;
      cursor: pointer;
      z-index: $z-high + 1;
    }

    .sliding-panel {
      $transition-time: 0.15s;
      $reverse-time: $transition-time;
      $reverse-delay: $transition-time * 0.7;

      position: fixed;
      padding: 0;

      box-sizing: border-box;
      max-height: 100vh;
      overflow: auto;
      opacity: 0;

      z-index: $z-high;

      top: -1000px;
      transition: top $reverse-time $reverse-delay ease-in-out, opacity 0s $reverse-delay * 2;

      &.open {
        top: 0;
        opacity: 1;
        transition: top $transition-time ease-in-out, opacity 0s 0s;
      }

      &.align-end {
        right: 0;
      }
      &.align-start {
        left: 0;
      }

      &.from-right {
        top: unset;
        right: -100%;
        transition: right $reverse-time $reverse-delay ease-in-out;

        &.align-end {
        }

        &.open {
          top: unset;
          right: 0;
          transition: right $transition-time ease-in-out;
        }
      }
    }
  }
</style>
