<template>
  <renderless-calendar
    ref="calendar"
    v-slot:default="{
      getModifiers,
      selectedDates,
      currentYear,
      prevPage,
      nextPage,
      weekDayNames,
      monthNames,
      calendar,
      onDateMouseOut,
      onDateMouseOver,
      onDateSelect,
      setMonth
    }"
    :min-date="minDate"
    :max-date="maxDate"
    :disabled-dates="disabledDates"
    :marked-dates="[]"
    :default-selected-dates="[selectedDate.string]"
    :capture-hover="false"
    :locale="localCalendarStrings"
    prevent-out-of-range
    mode="single"
    @onDateChange="handleDateChange">
    <div
      class="calendar"
      role="application"
      aria-label="Calendar">
      <div
        v-for="view in calendar"
        :key="`${view.month}-${view.year}`"
        class="calendar-view">
        <div class="-mx-sm -mt-sm flex items-center justify-between text-base">
          <button
            class="large"
            aria-label="Previous month"
            @click.prevent.stop="prevPage">
            <i class="material-icons text-4xl" aria-hidden="true">chevron_left</i>
          </button>
          <div
            class="title text-xl text-aba-blue"
            role="heading"
            aria-level="1">
            <span class="mr-4">{{ monthNames[view.month].full }}</span>
            <span>{{ view.year }}</span>
          </div>
          <button
            class="large"
            aria-label="Next month"
            @click.prevent.stop="nextPage">
            <i class="material-icons text-4xl" aria-hidden="true">chevron_right</i>
          </button>
        </div>
        <div
          class="grid grid-cols-7 text-base"
          role="row">
          <span
            v-for="day in weekDayNames"
            :key="day.short"
            class="flex h-5/6base items-center justify-center"
            role="columnheader"
            :aria-label="day.full">
            {{ day.short }}
          </span>
        </div>
        <div
          class="grid grid-cols-7"
          role="grid">
          <calendar-cell
            v-for="date in view.dates"
            :key="date.ms"
            v-bind="getModifier(date)"
            :date="date"
            @click.prevent="onDateSelect(date)"
            @mouseover="onDateMouseOver(date)"
            @mouseout="onDateMouseOut"/>
        </div>
      </div>
    </div>
  </renderless-calendar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import * as dateUtils from '../../../../lib/date'
import RenderlessCalendar from './RenderlessCalendar.vue'
import CalendarCell from './CalendarCell.vue'

interface Props {
  value?: string | number
  locale?: string
}

interface DateInfo {
  month: number | string
  year: number | string
  string: string
  ms?: number
}

interface CalendarRef {
  setMonth: (params: { month: number | string; year: number | string }) => void
}

defineOptions({
  name: 'EventCalendar'
})

const props = withDefault(defineProps<Props>(), {
  value: undefined,
  locale: undefined
})

const emit = defineEmits<{
  (e: 'input', value: number): void
}>()

// State
const calendar = ref<CalendarRef | null>(null)
const minDate = ref('')
const maxDate = ref('')
const disabledDates = ref<string[]>([])

// Computed
const localCalendarStrings = computed(() =>
  dateUtils.getCalendarStringsForLocale(props.locale)
)

const selectedDate = computed<DateInfo>(() => {
  const defaultDate = { month: '', year: '', string: '' }
  if (!props.value) return defaultDate

  const date = new Date(props.value)
  const year = date.getFullYear ()
  const month = date.getMonth ()
  const day = date.getDate ()

  return {
    year,
    month,
    string: `${year}-${month + 1}-${day}`
  }
})

// Method
const setMonth = () => {
  const { month, year } = selectedDate.value
  if (month !== '') {
    calendar.value?.setMonth({ month, year })
  }
}

const handleDateChange = (payload: DateInfo[]) => {
  if (payload[0]?.ms) {
    emit('input', payload[0].ms)
  }
}

// Watcher
watch(() => props.value, () => {
  setMonth ()
})

// Lifecycle
onMounted(() => {
  setMonth ()
})
</script>

<style scoped lang="scss">
.calendar {
  &-view {
    @apply p-4;
  }

  .grid {
    display: grid;
    gap: 0.5rem;

    &-cols-7 {
      grid-template-columns: repeat(7, minmax(0, 1fr));
    }
  }

  .title {
    @apply font-semibold;
  }

  button.large {
    @apply p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-aba-blue focus:ring-opacity-50;

    i {
      @apply text-gray-600;
    }
  }
}
</style>
