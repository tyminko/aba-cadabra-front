<template>
  <PopoverModal
    ref="popoverRef"
    :open="open"
    :class="['form-popover max-w-text w-full', { 'has-error': error }]"
    @esc="handleEsc"
    @close="handleClose">
    <template #header>
      <slot name="header">
        <div class="px-sm">
          <h1
            v-if="title"
            class="capitalize text-aba-blue font-medium">
            {{ title }}
          </h1>
          <div
            v-if="subtitle"
            class="text-sm text-gray-600 mt-1">
            {{ subtitle }}
          </div>
        </div>
      </slot>
    </template>

    <form
      ref="formRef"
      class="pb-sm relative"
      @submit.prevent="handleSubmit"
      @keyup.enter.prevent="handleEnterKey">
      <div
        class="form-body px-base overflow-auto"
        :class="{ 'opacity-50': processing }">
        <slot />
      </div>

      <footer class="flex h-base items-center px-sm">
        <slot name="footer">
          <div v-if="error" class="text-sm text-red-600 mr-auto">
            {{ error }}
          </div>
          <template v-if="!processing">
            <button
              v-if="buttons.close"
              type="button"
              class="ml-auto px-4 py-2 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-aba-blue focus:ring-opacity-50"
              @click.prevent="handleClose">
              {{ buttons.close }}
            </button>
            <button
              v-if="buttons.submit"
              :disabled="!valid || processing"
              :class="[
                'px-4 py-2 rounded transition-colors ml-2 focus:outline-none focus:ring-2 focus:ring-opacity-50',
                valid && !processing
                  ? 'bg-aba-blue text-white hover:bg-aba-blue-dark focus:ring-aba-blue'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed focus:ring-gray-400'
              ]"
              type="submit">
              {{ buttons.submit }}
            </button>
          </template>
        </slot>
      </footer>

      <TransitionFade>
        <div
          v-if="processing"
          class="progress-overlay absolute w-full h-full inset-0 flex flex-col items-center justify-center z-50 bg-milk/90 backdrop-blur-sm">
          <div class="loading-spinner mb-4"></div>
          <div class="text-xl text-aba-blue text-center">
            {{ processingMessage }}
          </div>
          <div
            v-if="processingSubMessage"
            class="text-sm text-gray-600 mt-2 text-center">
            {{ processingSubMessage }}
          </div>
        </div>
      </TransitionFade>
    </form>
  </PopoverModal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PopoverModal from '../UI/PopoverModal.vue'
import { TransitionFade } from '../UI/transitions'

// Prop
const props = defineProp({
  open: {
    type: Boolean,
    default: false
  },
  processing: {
    type: Boolean,
    default: false
  },
  valid: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  buttons: {
    type: Object,
    default: () => ({
      close: 'Cancel',
      submit: 'Submit'
    }),
    validator: (value) => {
      return value && (
        ('close' in value && typeof value.close === 'string') ||
        ('submit' in value && typeof value.submit === 'string')
      )
    }
  },
  processingMessage: {
    type: String,
    default: 'Processing...'
  },
  processingSubMessage: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  preventCloseOnProcessing: {
    type: Boolean,
    default: true
  },
  submitOnEnter: {
    type: Boolean,
    default: false
  }
})

// Emit
const emit = defineEmit({
  close: null,
  esc: null,
  submit: null
})

// Ref
const popoverRef = ref(null)
const formRef = ref(null)

// Method
const handleClose = () => {
  if (props.preventCloseOnProcessing && props.processing) {
    return
  }

  emit('close')
  if (popoverRef.value) {
    popoverRef.value.releaseBgScroll ()
  }
}

const handleEsc = () => {
  if (props.preventCloseOnProcessing && props.processing) {
    return
  }

  emit('esc')
}

const handleSubmit = () => {
  if (!props.valid || props.processing) {
    return
  }

  emit('submit')
}

const handleEnterKey = (event) => {
  if (!props.submitOnEnter || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
    return
  }

  // Don't submit if the active element is a textarea or contenteditable
  const activeElement = document.activeElement
  if (
    activeElement?.tagName === 'TEXTAREA' ||
    activeElement?.getAttribute('contenteditable') === 'true'
  ) {
    return
  }

  handleSubmit ()
}

// Lifecycle
onMounted(() => {
  if (formRef.value) {
    formRef.value.setAttribute('novalidate', '')
  }
})

onBeforeUnmount(() => {
  if (popoverRef.value) {
    popoverRef.value.releaseBgScroll ()
  }
})
</script>

<style lang="scss" scoped>
.form-popover {
  .form-body {
    max-height: calc(80vh - 120px);
  }

  .progress-overlay {
    animation: fadeIn 0.2s ease-in-out;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-aba-blue);
    animation: spin 1s linear infinite;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
