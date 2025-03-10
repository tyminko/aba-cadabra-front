<template>
  <div
    ref="dropzoneRef"
    :class="{ dropzone: isDroppable }"
    role="region"
    :aria-label="message"
    @dragover.prevent
    @drop.prevent>
    <div
      ref="dropzoneOverlayRef"
      class="dropzone-overlay"
      :class="{ active: isDroppable }"
      role="presentation">
      <slot name="dropzone-message">
        <div
          class="dropzone-message"
          role="status"
          aria-live="polite">
          {{ message }}
        </div>
      </slot>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
import type { Ref } from 'vue'

const { ref, onMounted, onUnmounted } = defineComponent({})

interface Props {
  selector?: string
  message?: string
  accept?: string[]
}

const props = withDefault(defineProps<Props>(), {
  selector: '',
  message: 'Drop files here',
  accept: () => []
})

const emit = defineEmits<{
  (e: 'files', files: File[]): void
  (e: 'dragenter'): void
  (e: 'dragleave'): void
}>()

// Ref
const dropzoneRef = ref<HTMLElement | null>(null)
const dropzoneOverlayRef = ref<HTMLElement | null>(null)
const isDroppable = ref(false)

// Method
const getDropzone = (): HTMLElement | null => {
  const customDropzone = props.selector ? document.querySelector(props.selector) as HTMLElement : null

  if (props.selector && !customDropzone) {
    console.warn(`Dropzone: selector "${props.selector}" does not match anything. A default dropzone is used instead`)
  }

  return customDropzone || dropzoneRef.value
}

const setupDropzone = () => {
  const dropzone = getDropzone ()
  if (!dropzone || !dropzoneOverlayRef.value) return

  // Move overlay to target dropzone
  dropzone.append(dropzoneOverlayRef.value)

  // Handle drag event
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault ()
    isDroppable.value = true
    emit('dragenter')
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault ()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragLeave = () => {
    isDroppable.value = false
    emit('dragleave')
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault ()
    isDroppable.value = false

    if (!e.dataTransfer?.files) return

    const files = Array.from(e.dataTransfer.files).filter(file => {
      if (props.accept.length === 0) return true
      return props.accept.some(type => file.type.startsWith(type))
    })

    if (files.length > 0) {
      emit('files', files)
    }
  }

  // Add event listener
  dropzone.addEventListener('dragenter', handleDragEnter)
  dropzone.addEventListener('dragover', handleDragOver)
  dropzone.addEventListener('dragleave', handleDragLeave)
  dropzone.addEventListener('drop', handleDrop)

  // Cleanup function
  return () => {
    dropzone.removeEventListener('dragenter', handleDragEnter)
    dropzone.removeEventListener('dragover', handleDragOver)
    dropzone.removeEventListener('dragleave', handleDragLeave)
    dropzone.removeEventListener('drop', handleDrop)
  }
}

// Lifecycle
let cleanup: (() => void) | undefined

onMounted(() => {
  cleanup = setupDropzone ()
})

onUnmounted(() => {
  if (cleanup) cleanup ()
})
</script>

<style lang="scss" scoped>
.dropzone {
  position: relative;
  min-height: 100px;
}

.dropzone-overlay {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-semitransparent, rgba(255, 255, 255, 0.9));
  border: 2px dashed var(--color-aba-blue, #4f46e5);
  border-radius: 0.5rem;
  z-index: 50;
  pointer-events: none;

  &.active {
    display: flex;
  }
}

.dropzone-message {
  font-size: 1.125rem;
  color: var(--color-aba-blue, #4f46e5);
  text-align: center;
  padding: 1rem;
}
</style>
