<template>
  <div
    class="px-input"
    :class="{ 'px-input--error': error }">
    <input
      ref="inputRef"
      type="text"
      class="px-input__field"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="label"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      :disabled="disabled"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      pattern="[0-9]*"
      inputmode="numeric" />
    <span class="px-input__unit">px</span>

    <div
      v-if="error"
      :id="errorId"
      class="px-input__error"
      role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Generate unique ID for error message
const errorId = `px-input-error-${Math.random ().toString(36).substr(2, 9)}`

interface Props {
  modelValue?: string | number
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  min?: number
  max?: number
}

const props = withDefault(defineProps<Props>(), {
  modelValue: '',
  placeholder: '0',
  label: 'Pixel value',
  error: '',
  disabled: false,
  min: 0,
  max: 9999
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: number): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')

  if (value === '') {
    emit('update:modelValue', '')
    emit('change', 0)
    return
  }

  const numValue = parseInt(value, 10)
  if (numValue >= props.min && numValue <= props.max) {
    emit('update:modelValue', value)
    emit('change', numValue)
  } else {
    if (inputRef.value) {
      inputRef.value.value = String(props.modelValue)
    }
  }
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}
</script>

<style lang="scss" scoped>
.px-input {
  position: relative;
  display: inline-flex;
  align-items: center;

  &__field {
    width: 4rem;
    padding: 0.375rem 2rem 0.375rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25;
    color: var(--color-text-primary, #111827);
    background-color: var(--color-bg-primary, white);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-aba-blue, #4f46e5);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }

    &:disabled {
      background-color: var(--color-bg-disabled, #f3f4f6);
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--color-text-placeholder, #9ca3af);
    }
  }

  &__unit {
    position: absolute;
    right: 0.5rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
    pointer-events: none;
  }

  &__error {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--color-error, #ef4444);
  }

  &--error &__field {
    border-color: var(--color-error, #ef4444);

    &:focus {
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
    }
  }
}
</style>
