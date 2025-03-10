<template>
  <div v-click-outside="close" class="sliding-panel-wrap">
    <div class="trigger trigger-wrap">
      <slot name="trigger" :on="toggle" :open="isOpen" />
    </div>
    <div
      ref="panelRef"
      :class="[`from-${from}`, `align-${align}`, {open: isOpen}]"
      class="sliding-panel"
      @click.native="toggle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ClickOutside from 'vue-click-outside'

// Prop
const props = defineProp({
  from: { type: String, default: 'top' },
  align: { type: String, default: 'end' },
  margin: { type: Number, default: 0 }
})

// Emit
const emit = defineEmit(['stateChanged'])

// Ref
const panelRef = ref(null)
const isOpen = ref(false)

// Route
const route = useRoute ()

// Method
const parseShadow = (shadowStr) => {
  const sizes = [0, 0, 0, 0]
  if (shadowStr === 'none') return size
  shadowStr = shadowStr.replace(/\s?rgba?\(.*\)\s?/, '')
  return shadowStr.split(' ').map(n => parseInt(n))
}

const getHeight = () => {
  const panel = panelRef.value
  if (!panel) return null

  const preDisplay = panel.style.display
  const { display, boxShadow } = window.getComputedStyle(panel)
  const shadow = parseShadow(boxShadow)
  const bottomShadow = shadow[1] + shadow[2] + (shadow.length > 3 ? shadow[3] : 0)

  if (display === 'none') panel.style.display = 'block'
  const h = panel.getBoundingClientRect ().height + bottomShadow
  if (display === 'none') panel.style.display = preDisplay

  return h
}

const setTop = () => {
  const panel = panelRef.value
  if (!panel) return

  if (isOpen.value) {
    panel.style.top = '0'
  } else {
    panel.style.top = -getHeight () + 'px'
  }
}

const close = () => {
  isOpen.value = false
}

const toggle = () => {
  isOpen.value = !isOpen.value
}

const jumpTop = () => {
  const panel = panelRef.value
  if (!panel) return

  const transition = panel.style.transition
  panel.style.transition = 'none 0s ease 0s'
  setTop ()
  panel.style.transition = transition
}

// Watcher
watch(route, () => {
  close ()
})

watch(isOpen, (val) => {
  setTop ()
  nextTick(() => {
    emit('stateChanged', val)
  })
})

// Lifecycle
onMounted(() => {
  setTop ()
})

// Expose methods for template ref
defineExpose({
  close,
  toggle,
  jumpTop
})
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

      &.open {
        top: unset;
        right: 0;
        transition: right $transition-time ease-in-out;
      }
    }
  }
}
</style>
