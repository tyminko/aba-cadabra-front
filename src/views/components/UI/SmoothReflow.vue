<template>
  <component :is="tag" ref="element" :style="style">
    <slot/>
  </component>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Prop
const props = defineProp({
  tag: {
    type: String,
    default: 'div'
  },
  options: {
    type: Object,
    default: () => ({
      transition: 'height .15s linear'
    })
  }
})

const element = ref(null)
const style = ref({
  transition: props.options.transition || 'height .15s linear',
  height: 'auto',
  overflow: 'hidden'
})

let resizeObserver = null

onMounted(() => {
  if (!element.value) return

  resizeObserver = new ResizeObserver(() => {
    // Let the element adjust to its content naturally
    style.value.height = 'auto'
  })

  resizeObserver.observe(element.value)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect ()
  }
})
</script>
