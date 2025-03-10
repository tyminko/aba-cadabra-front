<template>
  <transition
    name="height"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
    @after-leave="afterLeave">
    <slot v-if="show"></slot>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  duration?: number
  easing?: string
}

const props = withDefault(defineProps<Props>(), {
  duration: 300,
  easing: 'ease-in-out'
})

const emit = defineEmits<{
  (e: 'transition-start'): void
  (e: 'transition-end'): void
}>()

const element = ref<HTMLElement | null>(null)
let rafId: number | null = null

const enter = (el: HTMLElement): void => {
  element.value = el
  el.style.height = 'auto'
  const height = el.offsetHeight
  el.style.height = '0'

  rafId = requestAnimationFrame(() => {
    el.style.transition = `height ${props.duration}ms ${props.easing}`
    el.style.height = `${height}px`
  })

  emit('transition-start')
}

const afterEnter = (el: HTMLElement): void => {
  el.style.height = 'auto'
  emit('transition-end')
}

const leave = (el: HTMLElement): void => {
  element.value = el
  el.style.height = `${el.offsetHeight}px`

  rafId = requestAnimationFrame(() => {
    el.style.transition = `height ${props.duration}ms ${props.easing}`
    el.style.height = '0'
  })

  emit('transition-start')
}

const afterLeave = (el: HTMLElement): void => {
  el.style.height = ''
  emit('transition-end')
}

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
})
</script>

<style lang="scss" scoped>
.height-enter-active,
.height-leave-active {
  overflow: hidden;
}

.height-enter-from,
.height-leave-to {
  height: 0;
}
</style>
