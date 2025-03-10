<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen"
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
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getRootPath } from '../../../lib/bookmarks'
import { bodyScrollGuard } from '../../../lib/control-body-scroll'

// Router
const router = useRouter ()

// Prop
defineProp({
  bookmark: {
    type: [Object, null],
    default: null
  }
})

// Emit
const emit = defineEmit(['close', 'esc'])

// State
const isOpen = ref(true)
const allowClickOutside = ref(true)
const allowCoBack = ref(true)

// Method
const goBack = () => {
  history.back ()
}

const close = () => {
  if (isOpen.value && allowClickOutside.value) {
    isOpen.value = false
    emit('close')
    setTimeout(() => {
      const rootPath = getRootPath () || '/'
      router.push(rootPath)
    }, 200)
  }
}

const setBodyScroll = (freeze) => {
  if (freeze) {
    bodyScrollGuard.freezeBodyScroll ()
  } else {
    bodyScrollGuard.releaseBodyScroll ()
  }
}

const setAllowClickOutside = () => {
  if (isOpen.value) {
    setTimeout(() => { allowClickOutside.value = true }, 100)
  } else {
    allowClickOutside.value = false
  }
}

// Event handler
const handleEscKey = (e) => {
  if (e.key === 'Escape' || e.keyCode === 27) {
    emit('esc', e)
    close ()
  }
}

// Lifecycle hook
onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
  setBodyScroll(isOpen.value)
  setAllowClickOutside ()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
  bodyScrollGuard.releaseBodyScroll ()
})

// Watcher
watch(() => isOpen.value, (value) => {
  setBodyScroll(value)
  setAllowClickOutside ()
})
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
      padding: $base-padding;
      // border: $border-thick-w solid #888888;

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
      background: rgba(215, 215, 215, 0.8);
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>
