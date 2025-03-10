<template>
  <div
    class="float-label"
    :class="{
      'float-label--focused': isFocused,
      'float-label--filled': isFilled,
      'float-label--error': error
    }">
    <label
      :for="inputId"
      class="float-label__label"
      :data-required="required">
      {{ label }}
    </label>

    <div class="float-label__input-wrap">
      <slot
        :id="inputId"
        :focused="isFocused"
        :filled="isFilled"
        :on-focus="handleFocus"
        :on-blur="handleBlur" />
    </div>

    <div
      v-if="error"
      class="float-label__error"
      role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Generate unique ID for input
const inputId = `float-label-${Math.random ().toString(36).substr(2, 9)}`

interface Props {
  label: string
  modelValue?: string | number
  required?: boolean
  error?: string
}

const props = withDefault(defineProps<Props>(), {
  label: '',
  modelValue: '',
  required: false,
  error: ''
})

const isFocused = ref(false)
const isFilled = computed(() => {
  return props.modelValue !== undefined && props.modelValue !== ''
})

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}
</script>

<style lang="scss" scoped>
.float-label {
  position: relative;
  margin-bottom: 1.5rem;

  &__label {
    position: absolute;
    top: 0.5rem;
    left: 0.75rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    transform-origin: 0 0;
    transition: all 0.2s ease;
    pointer-events: none;

    &[data-required="true"]::after {
      content: "*";
      margin-left: 0.25rem;
      color: var(--color-error, #ef4444);
    }
  }

  &__input-wrap {
    position: relative;
  }

  &__error {
    position: absolute;
    bottom: -1.25rem;
    left: 0;
    font-size: 0.75rem;
    color: var(--color-error, #ef4444);
  }

  &--focused,
  &--filled {
    .float-label__label {
      transform: translateY(-1.4rem) scale(0.85);
      color: var(--color-aba-blue, #4f46e5);
    }
  }

  &--error {
    .float-label__label {
      color: var(--color-error, #ef4444);
    }
  }
}
</style>
