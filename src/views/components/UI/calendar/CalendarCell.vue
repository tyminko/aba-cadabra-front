<template>
  <button
    class="calendar-cell h-5/6base w-5/6base flex items-center justify-center text-sm whitespace-no-wrap"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-selected="isSelected"
    :aria-disabled="isDisabled"
    :disabled="isDisabled"
    role="gridcell">
    <span>{{ date.day }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComputedRef } from 'vue'

interface DateInfo {
  day: number
  month: number
  year: number
  ms: number
  isWeekend: boolean
  isOtherMonthDay: boolean
}

interface Props {
  date: DateInfo
  selectedDates?: DateInfo[]
  isSelected?: boolean
  isDisabled?: boolean
  isBetween?: boolean
  isOneDayBefore?: boolean
  isOneDayAfter?: boolean
  isLast?: boolean
  isFirst?: boolean
  isOneDayBeforeFirst?: boolean
  isOneDayBeforeLast?: boolean
}

const props = withDefault(defineProps<Props>(), {
  selectedDates: () => [],
  isSelected: false,
  isDisabled: false,
  isBetween: false,
  isOneDayBefore: false,
  isOneDayAfter: false,
  isLast: false,
  isFirst: false,
  isOneDayBeforeFirst: false,
  isOneDayBeforeLast: false
})

const rootClasses: ComputedRef<Record<string, boolean>> = computed(() => ({
  '--is-other-month-day': props.date.isOtherMonthDay,
  '--selected': props.isSelected,
  '--weekend': props.date.isWeekend,
  '--disabled': props.isDisabled,
  '--between': props.isBetween,
  '--first': props.isFirst,
  '--last': props.isLast,
  '--one-day-before': props.isOneDayBefore,
  '--one-day-after': props.isOneDayAfter,
  '--one-day-before-first': props.isOneDayBeforeFirst,
  '--one-day-before-last': props.isOneDayBeforeLast
}))

const ariaLabel: ComputedRef<string> = computed(() => {
  const date = new Date(props.date.ms)
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)

  let status = ''
  if (props.isSelected) status = ', selected'
  if (props.isDisabled) status = ', disabled'
  if (props.isBetween) status = ', in range'

  return `${formattedDate}${status}`
})
</script>

<!--suppress CssInvalidAtRule -->
<style scoped lang="scss">
  .calendar-cell {
    transition: font-size 0.05s, background-color 0.1s;
    &:active {
      @apply rounded-none text-aba-blue text-xl;
    }
    &:not(.--disabled):not(.--selected):hover {
      @apply bg-gray-100;
    }
    &.--disabled:not(.--between) {
      opacity: 0.3;
      cursor: not-allowed;
    }
    &.--between {
      @apply bg-aba-blue-semi rounded-none;
    }
    &.--weekend {
      @apply text-aba-blue;
    }
    &.--selected {
      @apply text-white relative text-xl bg-aba-blue rounded-full;
    }
    &.--is-other-month-day:not(.--disabled):not(.--between):not(.--selected) {
      @apply text-gray-400;
    }
    &:focus {
      @apply outline-none ring-2 ring-aba-blue ring-opacity-50;
    }
  }
</style>
