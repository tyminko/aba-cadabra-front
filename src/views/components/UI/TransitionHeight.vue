<template>
  <transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave">
    <slot />
  </transition>
</template>
<script>
/**
  https://github.com/maoberlehner/transition-to-height-auto-with-vue
*/
export default {
  name: `TransitionExpand`,
  methods: {
    afterEnter (element) {
      // eslint-disable-next-line no-param-reassign
      element.style.height = `auto`
    },
    enter (element) {
      let { width, height } = getComputedStyle(element)
      this.minHeight = height
      /* eslint-disable no-param-reassign */
      element.style.width = width
      element.style.position = `absolute`
      element.style.visibility = `hidden`
      element.style.height = `auto`
      element.style.whiteSpace = 'initial'
      element.style.textOverflow = 'unset'
      /* eslint-enable */
      height = getComputedStyle(element).height
      /* eslint-disable no-param-reassign */
      element.style.width = null
      element.style.position = null
      element.style.visibility = null
      element.style.whiteSpace = null
      element.style.textOverflow = null
      element.style.height = this.minHeight
      /* eslint-enable */
      // Force repaint to make sure the
      // animation is triggered correctly.
      // eslint-disable-next-line no-unused-expressions
      getComputedStyle(element).height
      setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
        element.style.height = height
      })
    },
    leave (element) {
      const { height } = getComputedStyle(element)
      // eslint-disable-next-line no-param-reassign
      element.style.height = height
      // Force repaint to make sure the
      // animation is triggered correctly.
      // eslint-disable-next-line no-unused-expressions
      getComputedStyle(element).height
      setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
        element.style.height = 0
      })
    }
  }
  // render (createElement, context) {
  //   const data = {
  //     props: {
  //       name: `expand`,
  //       minHeight: { type: Number, default: 0 }
  //     },
  //     on: {

  //     }
  //   }
  //   return createElement(`transition`, data, context.children)
  // }
}
</script>

<style scoped>
* {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>

<style>
.expand-enter-active,
.expand-leave-active {
  transition: height 1s ease-in-out;
  overflow: hidden;
}
.expand-enter,
.expand-leave-to {
  height: 0;
}
</style>
