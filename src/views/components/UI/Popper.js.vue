<template>
  <span ref="popper-root">
    <transition :name="transitionName" @after-leave="doDestroy">
      <span v-if="!disabled && showPopper" ref="popper" :id="id" class="popper">
        <span class="popper-content">
          <slot :hide="hide"/>
        </span>
      </span>
    </transition>
    <span ref="reference" class="popper-trigger">
      <slot name="reference" :show="showPopper"/>
    </span>
  </span>
</template>

<script>
import simpleID from '../../../lib/simpleId'
import { createPopper } from '@popperjs/core'

export default {
  name: 'Popper',
  props: {
    trigger: {
      type: [String, Boolean],
      default: 'click',
      validator: value => (typeof value === 'boolean' || ['click', 'hover'].indexOf(value) > -1)
    },
    modifiers: { type: Array, default: () => ([]) },
    strategy: { type: String, default: '' },
    placement: {
      type: String,
      default: 'auto',
      validator: val => [
        'auto',
        'auto-start',
        'auto-end',
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'right',
        'right-start',
        'right-end',
        'left',
        'left-start',
        'left-end',
        'cursor-auto',
        'cursor-auto-start',
        'cursor-auto-end',
        'cursor-top',
        'cursor-top-start',
        'cursor-top-end',
        'cursor-bottom',
        'cursor-bottom-start',
        'cursor-bottom-end',
        'cursor-right',
        'cursor-right-start',
        'cursor-right-end',
        'cursor-left',
        'cursor-left-start',
        'cursor-left-end',
        'cursor'
      ].includes(val)
    },
    position: { type: Object, default: null },
    disabled: Boolean,
    noArrow: Boolean,
    arrowSize: { type: Number, default: 12 },
    referenceSelector: { type: String, default: '' },
    boundariesSelector: { type: String, default: '' },
    boundariesPadding: { type: [String, Number], default: 0 },
    delayOnMouseEnter: { type: Number, default: 100 },
    delayOnMouseLeave: { type: Number, default: 200 },
    forceShow: Boolean,
    appendToBody: Boolean,
    touchable: Boolean,
    transition: { type: String, default: '' }
  },

  data () {
    return {
      referenceEl: null,
      virtualReferenceEl: null,
      popperInstance: null,
      showPopper: false,
      timer: null,
      id: simpleID()
    }
  },

  computed: {
    triggerAction () {
      return typeof this.trigger === 'boolean'
        ? null
        : this.touchable ? 'click' : this.trigger
    },

    transitionName () {
      return this.transition || this.triggerAction === 'hover' ? 'popper-hover' : 'popper-click'
    },

    popperPlacementAxis () {
      if (this.popperPlacement.startsWith('top') || this.popperPlacement.startsWith('bottom')) {
        return 'y'
      }
      if (this.popperPlacement.startsWith('left') || this.popperPlacement.startsWith('right')) {
        return 'x'
      }
      return ''
    },

    popperPlacement () {
      if (this.placement.startsWith('cursor-')) {
        return this.placement.replace('cursor-', '')
      } else if (this.placement === 'cursor') {
        return 'auto'
      }
      return this.placement
    },

    popperOptions () {
      const options = { placement: this.popperPlacement }
      if (this.strategy) {
        options.strategy = this.strategy
      }

      let modifiers = [
        { name: 'offset', options: { offset: [0, this.noArrow ? 0 : this.arrowSize] } },
        { name: 'arrow', options: { padding: this.arrowSize } },
        { name: 'onFirstUpdate', fn: state => this.$emit('created', state) }
      ]
      if (this.boundariesSelector) {
        const boundariesElement = document.querySelector(this.boundariesSelector)
        if (boundariesElement) {
          modifiers = [
            ...modifiers,
            { name: 'flip', options: { boundary: boundariesElement, padding: this.boundariesPadding } },
            { name: 'preventOverflow', options: { boundary: boundariesElement, padding: this.boundariesPadding } }
          ]
        }
      }
      modifiers = [...modifiers, ...this.modifiers]
      return { ...options, modifiers }
    }
  },

  watch: {
    position (value) {
      if (this.placement.startsWith('cursor-')) {
        const { x, y } = value
        this.updateVirtualReferenceEl(x, y)
      }
    },

    async trigger (value) {
      if (typeof this.trigger === 'boolean') {
        if (value) {
          this.show()
          await this.$nextTick()
          const { x, y } = this.position
          this.updateVirtualReferenceEl(x, y)
        } else {
          this.hide()
        }
      }
    },

    arrowSize () {
      this.setArrowSize()
    },

    async showPopper (value) {
      if (value) {
        await this.$nextTick()
        this.popper = this.$refs.popper
        this.updatePopper()
        this.$emit('toggle', true)
        this.$emit('show', this)
      } else {
        this.$emit('toggle', false)
        this.$emit('hide', this)
      }
    },

    forceShow: {
      handler (value) {
        this[value ? 'doShow' : 'doClose']()
      },
      immediate: true
    },

    disabled (value) {
      if (value) {
        this.showPopper = false
      }
    }
  },

  created () {
    this.appendedArrow = false
    this.appendedToBody = false
  },

  mounted () {
    if (this.referenceSelector) {
      this.referenceEl = document.querySelector(this.referenceSelector)
    } else {
      this.referenceEl = this.reference || this.$refs.reference
    }
    this.popper = this.$refs.popper
    this.setArrowSize()
    this.setupListenersForTrigger(this.triggerAction)
  },

  methods: {
    async toggle (e) {
      if (!this.forceShow) {
        this.showPopper ? this.hide() : this.show(e)
      }
    },

    showOnMouseEnter (e) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.show(e)
      }, this.delayOnMouseEnter)
    },

    hideOnMouseLeave () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.hide()
      }, this.delayOnMouseLeave)
    },

    async show (e) {
      this.showPopper = true
      if (this.placement.startsWith('cursor') && typeof this.trigger !== 'boolean') {
        await this.$nextTick()
        this.updateVirtualReferenceElOnEvent(e)
      }
    },

    hide () {
      this.showPopper = false
      this.appendedArrow = false
    },

    setupListenersForTrigger (trigger) {
      const el = this.referenceEl || this.$refs.reference || null
      if (!el) return
      switch (trigger) {
        case 'click':
          el.addEventListener('click', this.toggle)
          document.addEventListener('click', this.hideOnClickOutside)
          break
        case 'hover':
          const showEvents = ['mouseenter', 'focus']
          const hideEvents = ['mouseleave', 'blur']

          showEvents.forEach(event => {
            el.addEventListener(event, this.showOnMouseEnter)
          })
          hideEvents.forEach(event => {
            el.addEventListener(event, this.hideOnMouseLeave)
          })
      }
    },

    removeListenersForTrigger (trigger) {
      const el = this.$refs['popper-root'] || null
      if (!el) return
      switch (trigger) {
        case 'click':
          el.removeEventListener('click', this.toggle)
          document.removeEventListener('click', this.hideOnClickOutside)
          break
        case 'hover':
          const showEvents = ['mouseenter', 'focus']
          const hideEvents = ['mouseleave', 'blur']

          showEvents.forEach(event => {
            el.removeEventListener(event, this.showOnMouseEnter)
          })
          hideEvents.forEach(event => {
            el.removeEventListener(event, this.hideOnMouseLeave)
          })
      }
    },

    setArrowSize () {
      if (!this.$refs['popper-root']) return
      this.$refs['popper-root'].style.setProperty('--popper-arrow-size', this.arrowSize + 'px')
    },

    doShow () {
      this.showPopper = true
    },

    doClose () {
      this.showPopper = false
      this.appendedArrow = false
    },

    doDestroy () {
      if (this.showPopper) {
        return
      }

      if (this.popperInstance) {
        this.popperInstance.destroy()
        this.popperInstance = null
      }

      if (this.appendedToBody) {
        this.appendedToBody = false
        document.body.removeChild(this.popper.parentElement)
      }
    },

    async createPopper () {
      if (!this.noArrow) {
        this.appendArrow(this.popper)
      }

      if (this.appendToBody && !this.appendedToBody) {
        this.appendedToBody = true
        document.body.appendChild(this.popper.parentElement)
      }

      if (this.popperInstance && this.popperInstance.destroy) {
        this.popperInstance.destroy()
      }

      if (this.placement.startsWith('cursor')) {
        if (!this.virtualReferenceEl) {
          this.virtualReferenceEl = {
            getBoundingClientRect: this.generateGetBoundingClientRect()
          }
        }
        this.popperInstance = createPopper(this.virtualReferenceEl, this.popper, this.popperOptions)
        window.addEventListener('resize', this.updateVirtualReferenceElOnEvent)
        this.getScrollableParents(this.$refs['popper-root'], []).forEach(el => {
          el.addEventListener('scroll', this.updateVirtualReferenceElOnEvent)
        })
      } else {
        this.popperInstance = createPopper(this.referenceEl, this.popper, this.popperOptions)
      }
    },

    destroyPopper () {
      this.removeListenersForTrigger(this.triggerAction)
      if (this.triggerAction === 'click') {
        document.removeEventListener('click', this.hideOnClickOutside)
      }
      if (this.placement.startsWith('cursor-')) {
        if (this.$refs['popper-root']) {
          this.getScrollableParents(this.$refs['popper-root'], []).forEach(el => {
            el.removeEventListener('scroll', this.updateVirtualReferenceElOnEvent)
          })
        }
      }
      this.showPopper = false
      this.appendedArrow = false
      this.doDestroy()
    },

    generateGetBoundingClientRect (x = 0, y = 0) {
      const rect = this.referenceEl
        ? this.referenceEl.getBoundingClientRect()
        : { height: 0, width: 0, top: 0, right: 0, bottom: 0, left: 0 }

      let { height, width, top, right, bottom, left } = rect
      switch (this.popperPlacementAxis) {
        // case 'x':
        //   height = 0
        //   top = y
        //   bottom = y
        //   break
        // case 'y':
        //   width = 0
        //   left = x
        //   right = x
        //   break
        default:
          // height = width = Math.min(height, width)
          // const half = height / 2
          width = 0
          height = 0
          top = y // - half
          bottom = y // + half
          left = x // - half
          right = x // + half
      }
      return () => ({ width, height, top, right, bottom, left })
    },

    updateVirtualReferenceElOnEvent ({ clientX: x, clientY: y }) {
      if ((!x || !y)) {
        // if it happens on scroll
        const { top, right, bottom, left } = this.virtualReferenceEl.getBoundingClientRect()
        x = left + (right - left) / 2
        y = top + (bottom - top) / 2
      }
      this.updateVirtualReferenceEl(x, y)
    },

    updateVirtualReferenceEl (x, y) {
      if (!this.virtualReferenceEl) this.virtualReferenceEl = {}
      this.virtualReferenceEl.getBoundingClientRect = this.generateGetBoundingClientRect(x, y)
      if (this.popperInstance) {
        this.popperInstance.update()
      }
    },

    appendArrow (element) {
      if (this.appendedArrow) {
        return
      }
      this.appendedArrow = true
      const arrow = document.createElement('div')
      arrow.setAttribute('data-popper-arrow', '')
      arrow.className = 'popper__arrow'
      element.appendChild(arrow)
    },

    updatePopper () {
      this.popperInstance ? this.popperInstance.update() : this.createPopper()
    },

    onMouseOver (e) {
      clearTimeout(this._timer)
      this._timer = setTimeout(async () => {
        this.showPopper = true
        await this.$nextTick()
        this.updateVirtualReferenceElOnEvent(e)
      }, this.delayOnMouseEnter)
    },

    onMouseOut () {
      clearTimeout(this._timer)
      this._timer = setTimeout(() => {
        this.showPopper = false
      }, this.delayOnMouseLeave)
    },

    hideOnClickOutside (e) {
      if (!this.$refs.popper ||
          !this.$el || !this.referenceEl ||
          this.elementContains(this.$el, e.target) ||
          this.elementContains(this.referenceEl, e.target) ||
          this.elementContains(this.$refs.popper, e.target)
      ) {
        return
      }

      this.$emit('documentClick', this)

      if (this.forceShow) {
        return
      }
      this.hide()
    },

    elementContains (elm, otherElm) {
      if (typeof elm.contains === 'function') {
        return elm.contains(otherElm)
      }
      return false
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
      if (position !== 'fixed' && el.parentElement) {
        parents = this.getScrollableParents(el.parentElement, parents)
      }
      return parents
    }
  },

  destroyed () {
    this.destroyPopper()
  }
}
</script>

<style lang="scss">
  @import "../../../styles/vars";

  :root {
    --popper-bg-color: #{$color-bg};
    --popper-border-color: #{$color-aba-blue};
    --popper-text-color: #{$text-color};
    --popper-border-width: 2px;
    --popper-arrow-size: 12px;
    --popper-drop-shadow: drop-shadow(0 2px 10px rgba(0,0,0,0.05));
  }

  $pop-border-w: var(--popper-border-width);
  $pop-bg-color: var(--popper-bg-color);
  $pop-border-color: var(--popper-border-color);
  $arrow-size: calc(var(--popper-arrow-size) - var(--popper-border-width) * 2);
  $arrow-after-size: var(--popper-arrow-size);

  @mixin arrow ($side) {
    $opposite-side: '';
    $scale: 0.6;

    $transform: scaleX($scale);
    $b-color: $pop-bg-color transparent;
    $b-after-color: $pop-border-color transparent;

    @if ($side == 'left' or $side == 'right') {
      $transform: scaleY($scale);
      $b-color: transparent $pop-bg-color;
      $b-after-color: transparent $pop-border-color;
    }

    @if ($side == 'top') {
      $opposite-side: 'bottom';
    }
    @else if ($side == 'bottom') {
      $opposite-side: 'top';
    }
    @else if ($side == 'left') {
      $opposite-side: 'right';
    }
    @else if ($side == 'right') {
      $opposite-side: 'left';
    }
    .popper__arrow {
      #{$opposite-side}: calc(var(--popper-arrow-size) * -1);
      &:before, &:after {
        transform: $transform;
        border-color: $b-color;
        border-#{$opposite-side}-width: 0;
      }
      &:after {
        border-color: $b-after-color;
        #{$side}: 0;
      }
    }
  }

  .dark {
    .popper {
      --popper-bg-color: #{$color-dimmed};
      --popper-border-color: #fff;
      --popper-text-color: #fff;
      --popper-drop-shadow: drop-shadow(0 2px 60px #{darken($color-dimmed, 8%)});
    }
  }

  .popper {
    max-width: calc(100% - #{$base-padding * 2});
    max-height: 100%;
    @apply p-base;

    width: auto;
    background-color: var(--popper-bg-color);
    position: absolute;
    border: var(--popper-border-width) solid var(--popper-border-color);
    border-radius: 3px;
    font-size: $font-size-caption;
    color: var(--popper-text-color);
    filter: var(--popper-drop-shadow);
    z-index: 200000;

    .popper-content{
      overflow-y: auto;
      height: 100%;
      width: 100%;
      word-break: break-all;
      text-align: start;
    }
    .popper__arrow {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--popper-arrow-size);
      height: var(--popper-arrow-size);
      z-index: 0;

      &:before, &:after {
        content: '';
        box-sizing: border-box;
        position: absolute;
        width: 100%;
        height: 100%;
        border-width: $arrow-size;
        border-style: solid;
      }
      &:after {
        z-index: -1;
        border-width: $arrow-after-size;
      }
    }

    &[data-popper-placement^="top"] {
      @include arrow(top);
    }

    &[data-popper-placement^="bottom"] {
      @include arrow(bottom);
    }

    &[data-popper-placement^="right"] {
      @include arrow(right);
    }

    &[data-popper-placement^="left"] {
      @include arrow(left);
    }
  }

  .popper-trigger {
    position: relative;
  }

  .popper-hover-enter-active {
    transition: opacity 0.2s
  }
  .popper-hover-leave-active {
    transition: opacity 0.5s
  }
  .popper-hover-enter, .popper-hover-leave-to {
    opacity: 0;
  }

  .popper-click-enter-active, .popper-click-leave-active {
    transition: opacity 0.2s
  }
  .popper-click-enter, .popper-click-leave-to {
    opacity: 0;
  }
</style>
