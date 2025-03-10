<template>
  <div
    class="tags-input"
    :class="{ 'tags-input--error': error }">
    <div
      ref="containerRef"
      class="tags-input__container"
      :aria-label="label"
      role="listbox"
      tabindex="0"
      @click="focusInput"
      @keydown.backspace="handleContainerBackspace">
      <span
        v-for="(tag, index) in modelValue"
        :key="index"
        class="tags-input__tag"
        role="option"
        :aria-selected="true">
        {{ tag }}
        <button
          type="button"
          class="tags-input__remove"
          :aria-label="`Remove ${tag}`"
          @click.stop="removeTag(index)">
          <i class="material-icons">close</i>
        </button>
      </span>

      <input
        ref="inputRef"
        type="text"
        class="tags-input__field"
        :placeholder="placeholder"
        :aria-label="inputLabel"
        :disabled="disabled"
        v-model="inputValue"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleInputBackspace"
        @keydown.delete="handleInputBackspace"
        @focus="handleFocus"
        @blur="handleBlur" />
    </div>

    <div
      v-if="error"
      class="tags-input__error"
      role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

interface Props {
  modelValue: string[]
  placeholder?: string
  label?: string
  inputLabel?: string
  error?: string
  disabled?: boolean
  maxTags?: number
  allowDuplicates?: boolean
}

const props = withDefault(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: 'Add tag...',
  label: 'Tags input',
  inputLabel: 'Type to add new tag',
  error: '',
  disabled: false,
  maxTags: Infinity,
  allowDuplicates: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'add', value: string): void
  (e: 'remove', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const inputValue = ref('')

const addTag = () => {
  const value = inputValue.value.trim ()
  if (!value || props.disabled) return

  if (!props.allowDuplicates && props.modelValue.include(value)) {
    return
  }

  if (props.modelValue.length >= props.maxTags) {
    return
  }

  const newTags = [...props.modelValue, value]
  emit('update:modelValue', newTags)
  emit('add', value)
  inputValue.value = ''
}

const removeTag = (index: number) => {
  if (props.disabled) return
  const removedTag = props.modelValue[index]
  const newTags = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newTags)
  emit('remove', removedTag)
}

const handleContainerBackspace = (e: KeyboardEvent) => {
  if (props.disabled) return
  if (document.activeElement === containerRef.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}

const handleInputBackspace = (e: KeyboardEvent) => {
  if (props.disabled) return
  if (!inputValue.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}

const focusInput = () => {
  if (!props.disabled) {
    inputRef.value?.focu ()
  }
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
  if (inputValue.value) {
    addTag ()
  }
}
</script>

<style lang="scss" scoped>
.tags-input {
  &__container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.375rem;
    min-height: 2.5rem;
    background-color: var(--color-bg-primary, white);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
    transition: all 0.2s ease;

    &:focus-within {
      border-color: var(--color-aba-blue, #4f46e5);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-primary, #111827);
    background-color: var(--color-bg-secondary, #f3f4f6);
    border-radius: var(--radius-full, 9999px);
  }

  &__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.25rem;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-secondary, #6b7280);
    border-radius: var(--radius-full, 9999px);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-bg-hover, #e5e7eb);
      color: var(--color-text-primary, #111827);
    }

    i {
      font-size: 1rem;
    }
  }

  &__field {
    flex: 1;
    min-width: 8rem;
    padding: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-text-primary, #111827);
    background: transparent;
    border: none;
    outline: none;

    &::placeholder {
      color: var(--color-text-placeholder, #9ca3af);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__error {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--color-error, #ef4444);
  }

  &--error &__container {
    border-color: var(--color-error, #ef4444);

    &:focus-within {
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
    }
  }
}
</style>
