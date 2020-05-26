<template>
  <div class="layout-wrap">
    <header>
      <div class="toggle-wrap">
        <button v-if="collapsible" class="secondary" @click.stop="toggle">
          <i class="material-icons dimmed">{{open?'chevron_left':'menu'}}</i>
        </button>
      </div>
      <div class="header-content-wrap">
        <slot name="header"/>
      </div>
    </header>
    <div class="push-box" :class="side">
      <div ref="sidebar" v-click-outside="pushOut" class="push-sidebar" :class="{collapsible}">
        <div ref="sidebar-content" class="sidebar-content" :class="{'opacity-0':!open}">
          <slot name="sidebar" :refresh="setPushMargin"/>
        </div>
      </div>
      <div class="layout-content-wrap" :class="{collapsible}">
        <slot name="content"/>
      </div>
    </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside'
import { mapState } from 'vuex'
export default {
  name: 'LayoutWithPushSidebar',
  directives: { ClickOutside },
  props: {
    responsive: Boolean,
    side: { type: String, default: 'left', validator: v => ['left', 'top', 'right', 'bottom'].includes(v) }
  },

  data: () => ({
    collapsible: true,
    open: false,
    contentMinWidth: 550
  }),

  computed: {
    ...mapState(['showEditor']),
    flow () {
      return this.side === 'left' || this.side === 'right' ? 'row' : 'column'
    }
  },

  watch: {
    collapsible (val) {
      if (!val) {
        this.pushIn()
      }
    },
    showEditor () {
      this.popupItem = document.getElementById('main-editor')
    }
  },

  mounted () {
    if (this.responsive) {
      this.setSidebarCollapsible()
      window.addEventListener('resize', this.setSidebarCollapsible)
    } else {
      // this.setPushMargin()
    }
  },

  methods: {
    setSidebarCollapsible () {
      const maxWidth = this.$refs.sidebar.getBoundingClientRect().width + this.contentMinWidth
      this.collapsible = window.innerWidth < maxWidth
      if (this.collapsible && this.open) {
        this.pushOut()
      }
      if (!this.collapsible && !this.open) {
        this.pushIn()
      }
    },

    toggle (e) {
      this.open = !this.open
      this.setPushMargin()
    },

    pushOut () {
      if (this.collapsible) {
        this.open = false
        this.setPushMargin()
      }
    },

    pushIn () {
      this.open = true
      this.setPushMargin()
    },

    setPushMargin () {
      const sidebar = this.$refs.sidebar
      const sidebarContent = this.$refs['sidebar-content']
      let size, margin
      if (this.side === 'left' || this.side === 'right') {
        size = sidebarContent.getBoundingClientRect().width
        if (sidebar.getBoundingClientRect().width !== size) sidebar.style.width = `${size}px`
      } else {
        size = sidebarContent.getBoundingClientRect().height
        if (sidebar.getBoundingClientRect().height !== size) sidebar.style.height = `${size}px`
      }
      margin = this.open ? 0 : -size
      document.documentElement.style.setProperty(`--push-margin-${this.side}`, `${margin}px`)
    }
  }
}
</script>

<style lang="scss">
  @import "../../../../styles/vars";

  $max-width-disable: 800px;
  $transition-time: 0.15s;
  .layout-wrap {
    & > header {
      display: flex;
      height: $base-size;
      width: 100vw;
      align-items: center;
      position: fixed;
      top: 0;
      left: 0;
      z-index: $z-index-header;

      .toggle-wrap {
        width: $base-size;
        height: $base-size;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      button {
        position: relative;
        width: $base-size * 0.75;
        height: $base-size * 0.75;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      button:after {
        content: '';
        position: absolute;
        width: 75%;
        height: 75%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: $color-bg;
        z-index: -1;
      }
      .header-content-wrap {
        flex-grow: 1;
      }
    }

    .push-box {
      height: 100%;
      display: flex;

      &.top, &.bottom {
        flex-flow: column;
      }
      &.left {
        margin-left: var(--push-margin-left);
        transition: margin-left $transition-time;
        overflow-x: hidden;
      }
      &.right {
        margin-right: var(--push-margin-right);
        transition: margin-right $transition-time;
      }
      &.top {
        margin-top: var(--push-margin-top);
        transition: margin-top $transition-time;
      }
      &.bottom {
        margin-bottom: var(--push-margin-bottom);
        transition: margin-bottom $transition-time;
      }

      &.left, &.right {
        .layout-content-wrap, .sidebar {
          height: 100%;
        }
      }

      .layout-content-wrap {
        flex-grow: 1;
        &.collapsible {
          width: 100vw;
          min-width: 100vw;
        }
      }

      .push-sidebar {
        flex-shrink: 0;
        overflow: auto;
        .sidebar-content {
          position: fixed;
          z-index: 100;
          transition: opacity $transition-time;
        }
      }
    }
  }
</style>
