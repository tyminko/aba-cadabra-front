<template>
  <div
    class="progress-container"
    role="progressbar"
    :aria-valuenow="progress"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="label">
    <div
      class="progress-bar"
      :style="{ width: `${progress}%` }"
      :class="{
        'progress-bar--indeterminate': indeterminate,
        'progress-bar--success': status === 'success',
        'progress-bar--error': status === 'error'
      }">
      <span class="sr-only">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress?: number
  indeterminate?: boolean
  status?: 'default' | 'success' | 'error'
  label?: string
}

const {
  progress = 0,
  indeterminate = false,
  status = 'default',
  label = 'Loading...'
} = defineProps<Props>()
</script>

<style lang="scss" scoped>
.progress-container {
  width: 100%;
  height: var(--progress-height, 0.5rem);
  background-color: var(--color-bg-secondary, #e5e7eb);
  border-radius: var(--progress-radius, 0.25rem);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-aba-blue, #4f46e5);
  transition: width 0.3s ease-in-out;

  &--indeterminate {
    width: 50% !important;
    animation: indeterminate 1.5s infinite ease-in-out;
  }

  &--success {
    background-color: var(--color-success, #10b981);
  }

  &--error {
    background-color: var(--color-error, #ef4444);
  }
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
