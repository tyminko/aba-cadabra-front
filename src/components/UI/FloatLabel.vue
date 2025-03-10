<template>
  <div class="float-label">
    <label :for="id" :class="{ active: isActive }">{{ label }}</label>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  label: string
  modelValue?: string | number
}

const props = defineProps<Props>()

const isActive = computed(() => {
  return !!props.modelValue || props.modelValue === 0
})
</script>

<style scoped>
.float-label {
  position: relative;
  margin-bottom: 1rem;
}

label {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  transition: all 0.2s ease;
  color: #666;
  pointer-events: none;
}

label.active {
  transform: translateY(-1.5rem) scale(0.75);
  color: #4f46e5;
}
</style>
