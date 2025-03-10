<template>
  <div
    class="dropdown-select"
    :class="{ 'dropdown-select--open': isOpen }">
    <button
      ref="triggerRef"
      class="dropdown-select__trigger"
      :class="{ 'dropdown-select__trigger--error': error }"
      type="button"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="listId"
      :aria-label="label"
      :aria-describedby="error ? errorId : undefined"
      @click="toggle">
      <span class="dropdown-select__value">
        {{ selectedLabel || placeholder }}
      </span>
      <i class="material-icons dropdown-select__icon">
        {{ isOpen ? 'expand_less' : 'expand_more' }}
      </i>
    </button>

    <Transition name="expand">
      <div
        v-if="isOpen"
        :id="listId"
        class="dropdown-select__list"
        role="listbox"
        :aria-label="label">
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-select__option"
          :class="{ 'dropdown-select__option--selected': isSelected(option) }"
          role="option"
          :aria-selected="isSelected(option)"
          @click="select(option)">
          {{ option.label }}
        </div>
      </div>
    </Transition>

    <div
      v-if="error"
      :id="errorId"
      class="dropdown-select__error"
      role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Generate unique ID
const generateId = () => `id-${Math.random ().toString(36).substr(2, 9)}`
const listId = generateId ()
const errorId = generateId ()

interface Option {
  label: string
  value: any
}

interface Props {
  modelValue?: any
  options: Option[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}

const props = withDefault(defineProps<Props>(), {
  modelValue: undefined,
  options: () => [],
  placeholder: 'Select an option',
  label: 'Select an option',
  error: '',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected?.label
})

const isSelected = (option: Option) => option.value === props.modelValue

const toggle = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const close = () => {
  isOpen.value = false
}

const select = (option: Option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  close ()
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (triggerRef.value && !triggerRef.value.contain(target)) {
    close ()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.dropdown-select {
  position: relative;
  width: 100%;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-bg-primary, white);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--color-aba-blue, #4f46e5);
    }

    &:disabled {
      background-color: var(--color-bg-disabled, #f3f4f6);
      cursor: not-allowed;
    }

    &--error {
      border-color: var(--color-error, #ef4444);
    }
  }

  &__value {
    flex: 1;
    text-align: left;
    color: var(--color-text-primary, #111827);

    &:empty::before {
      content: attr(data-placeholder);
      color: var(--color-text-placeholder, #9ca3af);
    }
  }

  &__icon {
    margin-left: 0.5rem;
    font-size: 1.25rem;
    color: var(--color-text-secondary, #6b7280);
    transition: transform 0.2s ease;
  }

  &__list {
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

  &__option {
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm, 0.25rem);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-bg-hover, #f3f4f6);
    }

    &--selected {
      background-color: var(--color-bg-selected, #eff6ff);
      color: var(--color-aba-blue, #4f46e5);
    }
  }

  &__error {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-error, #ef4444);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
