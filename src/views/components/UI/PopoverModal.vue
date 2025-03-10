<template>
  <Teleport to="body">
    <TransitionRoot appear :show="open">
      <Dialog
        as="div"
        class="popover-modal"
        @close="handleClose">
        <div class="fixed inset-0 z-50">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0">
            <DialogOverlay
              class="modal-shadow fixed inset-0 bg-black/50 backdrop-blur-sm"
              @click="handleOverlayClick" />
          </TransitionChild>

          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <div
              class="modal-content w-full h-full bg-white rounded-sm shadow-xl transform transition-all"
              :class="contentClass"
              role="dialog"
              :aria-labelledby="titleId"
              :aria-describedby="descriptionId">
              <header class="flex h-base items-center pl-base">
                <slot name="header">
                  <DialogTitle
                    v-if="title"
                    :id="titleId"
                    class="text-lg font-medium text-gray-900">
                    {{ title }}
                  </DialogTitle>
                </slot>
                <button
                  type="button"
                  class="close-button w-base h-base ml-auto flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-aba-blue focus:ring-opacity-50 rounded-sm transition-colors"
                  @click="handleClose"
                  aria-label="Close dialog">
                  <i class="material-icons">close</i>
                </button>
              </header>

              <div
                :id="descriptionId"
                class="modal-body">
                <slot/>
              </div>

              <slot name="footer"/>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import { bodyScrollGuard } from '../../../lib/control-body-scroll'
import { useId } from '../../../composables/useId'

// Prop
const props = defineProp({
  open: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  contentClass: {
    type: [String, Array, Object],
    default: ''
  },
  preventCloseOnOverlay: {
    type: Boolean,
    default: false
  },
  preventCloseOnEsc: {
    type: Boolean,
    default: false
  }
})

// Emit
const emit = defineEmit({
  close: null,
  esc: null,
  'update:open': (value) => typeof value === 'boolean'
})

// Generated ID
const titleId = useId('modal-title')
const descriptionId = useId('modal-description')

// State
const allowClickOutside = ref(true)

// Method
const handleClose = () => {
  emit('close')
  emit('update:open', false)
}

const handleOverlayClick = () => {
  if (!props.preventCloseOnOverlay && allowClickOutside.value) {
    handleClose ()
  }
}

const handleEscKey = (e) => {
  if (e.key === 'Escape' || e.keyCode === 27) {
    if (!props.preventCloseOnEsc) {
      emit('esc', e)
      handleClose ()
    }
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
  if (props.open) {
    setTimeout(() => { allowClickOutside.value = true }, 100)
  } else {
    allowClickOutside.value = false
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
  setBodyScroll(props.open)
  setAllowClickOutside ()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
  bodyScrollGuard.releaseBodyScroll ()
})

// Watcher
watch(() => props.open, (value) => {
  setBodyScroll(value)
  setAllowClickOutside ()
})
</script>

<style lang="scss" scoped>
.popover-modal {
  position: fixed;
  z-index: 50;
  inset: 0;
  overflow-y: auto;

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: min-content;
    max-width: calc(100vw - 2rem);
    max-height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;

    .modal-body {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  .close-button {
    .material-icons {
      font-size: 1.5rem;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}

// Variable
:root {
  --base-size: 3.8rem;
  --base-padding: 1rem;
  --content-min-width: 5rem;
  --tag-inline-height: 3.8rem;
}
</style>
