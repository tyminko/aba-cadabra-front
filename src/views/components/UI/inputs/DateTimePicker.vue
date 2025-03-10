<template>
  <div
    class="datetime-picker"
    :class="{ 'datetime-picker--error': error }">
    <div class="datetime-picker__inputs">
      <input
        ref="dateRef"
        type="date"
        class="datetime-picker__field"
        :value="dateValue"
        :min="minDate"
        :max="maxDate"
        :aria-label="`${label} date`"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        :disabled="disabled"
        @input="handleDateInput"
        @focus="handleFocus"
        @blur="handleBlur" />

      <input
        ref="timeRef"
        type="time"
        class="datetime-picker__field"
        :value="timeValue"
        :aria-label="`${label} time`"
        :aria-invalid="!!error"
        :disabled="disabled"
        @input="handleTimeInput"
        @focus="handleFocus"
        @blur="handleBlur" />
    </div>

    <div
      v-if="error"
      :id="errorId"
      class="datetime-picker__error"
      role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

// Generate unique ID for error message
const errorId = `datetime-picker-error-${Math.random ().toString(36).substr(2, 9)}`

interface Props {
  modelValue?: Date | null
  label?: string
  error?: string
  disabled?: boolean
  minDate?: string
  maxDate?: string
}

const props = withDefault(defineProps<Props>(), {
  modelValue: null,
  label: 'Date and time',
  error: '',
  disabled: false,
  minDate: undefined,
  maxDate: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
  (e: 'change', value: Date | null): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const dateRef = ref<HTMLInputElement | null>(null)
const timeRef = ref<HTMLInputElement | null>(null)

const dateValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue.toISOString ().split('T')[0]
})

const timeValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue.toTimeString ().slice(0, 5)
})

const handleDateInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const date = target.value
  updateDateTime(date, timeValue.value)
}

const handleTimeInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const time = target.value
  updateDateTime(dateValue.value, time)
}

const updateDateTime = (date: string, time: string) => {
  if (!date || !time) {
    emit('update:modelValue', null)
    emit('change', null)
    return
  }

  const newDate = new Date(`${date}T${time}:00`)
  if (isNaN(newDate.getTime ())) {
    emit('update:modelValue', null)
    emit('change', null)
    return
  }

  emit('update:modelValue', newDate)
  emit('change', newDate)
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}
</script>

<style lang="scss" scoped>
.datetime-picker {
  &__inputs {
    display: flex;
    gap: 0.5rem;
  }

  &__field {
    padding: 0.5rem 0.75rem;
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

    &::-webkit-calendar-picker-indicator {
      color: var(--color-text-secondary, #6b7280);
      cursor: pointer;
    }
  }

  &__error {
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
