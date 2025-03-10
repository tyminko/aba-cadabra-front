<template>
  <Transition>
    <div
      v-if="show"
      class="spinner"
      role="status"
      aria-label="Loading"
      :aria-busy="show">
      <span class="sr-only">Loading...</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LoadingSpinner'
})

interface Props {
  show?: boolean
}

withDefault(defineProps<Props>(), {
  show: true
})
</script>

<style lang="scss" scoped>
.spinner {
  display: inline-block;
  width: var(--spinner-size, 1.5rem);
  height: var(--spinner-size, 1.5rem);
  border: 2px solid var(--color-aba-blue, #4f46e5);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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
