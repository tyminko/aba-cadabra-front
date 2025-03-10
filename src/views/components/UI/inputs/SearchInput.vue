<template>
  <div
    class="search-input"
    :class="{ 'search-input--focused': isFocused }">
    <div class="search-input__field-wrap">
      <i class="material-icons search-input__icon">search</i>
      <input
        ref="inputRef"
        type="search"
        class="search-input__field"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-label="label"
        :disabled="disabled"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.esc="handleClear"
        @keydown.down.prevent="handleArrowDown"
        @keydown.up.prevent="handleArrowUp"
        @keydown.enter.prevent="handleEnter" />
      <button
        v-if="modelValue"
        class="search-input__clear"
        type="button"
        :aria-label="clearLabel"
        @click="handleClear">
        <i class="material-icons">close</i>
      </button>
    </div>

    <div
      v-if="showResults && results.length > 0"
      class="search-input__results"
      role="listbox"
      :aria-label="`${label} results`">
      <div
        v-for="(result, index) in results"
        :key="result.id"
        class="search-input__result"
        :class="{ 'search-input__result--active': activeIndex === index }"
        role="option"
        :aria-selected="activeIndex === index"
        @click="handleSelect(result)"
        @mouseenter="activeIndex = index">
        <slot
          name="result"
          :result="result"
          :active="activeIndex === index">
          {{ result.label }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

interface SearchResult {
  id: string | number
  label: string
  [key: string]: any
}

interface Props {
  modelValue: string
  results?: SearchResult[]
  placeholder?: string
  label?: string
  clearLabel?: string
  disabled?: boolean
  minChars?: number
}

const props = withDefault(defineProps<Props>(), {
  modelValue: '',
  results: () => [],
  placeholder: 'Search...',
  label: 'Search',
  clearLabel: 'Clear search',
  disabled: false,
  minChars: 2
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'select', result: SearchResult): void
  (e: 'clear'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const activeIndex = ref(-1)
const showResults = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)

  if (value.length >= props.minChars) {
    emit('search', value)
    showResults.value = true
  } else {
    showResults.value = false
  }
}

const handleFocus = () => {
  isFocused.value = true
  if (props.modelValue.length >= props.minChars) {
    showResults.value = true
  }
}

const handleBlur = () => {
  // Delay hiding results to allow click events to fire
  setTimeout(() => {
    isFocused.value = false
    showResults.value = false
    activeIndex.value = -1
  }, 200)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  showResults.value = false
  activeIndex.value = -1
  inputRef.value?.focu ()
}

const handleArrowDown = () => {
  if (showResults.value && props.results.length > 0) {
    activeIndex.value = (activeIndex.value + 1) % props.results.length
  }
}

const handleArrowUp = () => {
  if (showResults.value && props.results.length > 0) {
    activeIndex.value = activeIndex.value <= 0
      ? props.results.length - 1
      : activeIndex.value - 1
  }
}

const handleEnter = () => {
  if (showResults.value && activeIndex.value >= 0) {
    handleSelect(props.results[activeIndex.value])
  }
}

const handleSelect = (result: SearchResult) => {
  emit('select', result)
  emit('update:modelValue', result.label)
  showResults.value = false
  activeIndex.value = -1
}

// Reset active index when results change
watch(() => props.results, () => {
  activeIndex.value = -1
})
</script>

<style lang="scss" scoped>
.search-input {
  position: relative;
  width: 100%;

  &__field-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__icon {
    position: absolute;
    left: 0.75rem;
    font-size: 1.25rem;
    color: var(--color-text-secondary, #6b7280);
    pointer-events: none;
  }

  &__field {
    width: 100%;
    padding: 0.625rem 2.5rem;
    font-size: 0.875rem;
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

  &__clear {
    position: absolute;
    right: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-text-secondary, #6b7280);
    border-radius: var(--radius-full, 9999px);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-bg-hover, #f3f4f6);
      color: var(--color-text-primary, #111827);
    }

    i {
      font-size: 1.125rem;
    }
  }

  &__results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    padding: 0.25rem;
    background-color: var(--color-bg-primary, white);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 50;
  }

  &__result {
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm, 0.25rem);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover,
    &--active {
      background-color: var(--color-bg-hover, #f3f4f6);
      color: var(--color-aba-blue, #4f46e5);
    }
  }
}
</style>
