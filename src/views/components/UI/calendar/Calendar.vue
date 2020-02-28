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
    <div class="">
      <div
        v-for="view in calendar"
        :key="`${view.month}-${view.year}`"
        class="">
        <div class="-mx-sm -mt-sm flex items-center justify-between text-base">
          <button class="large" @click.prevent.stop="prevPage">
            <i class="material-icons text-4xl">chevron_left</i>
          </button>
          <div class="title text-xl text-aba-blue">
            <span class="mr-4">{{ monthNames[view.month].full }}</span>
            <span>{{ view.year }}</span>
          </div>
          <button class="large" @click.prevent.stop="nextPage">
            <i class="material-icons text-4xl">chevron_right</i>
          </button>
        </div>
        <div class="grid grid-cols-7 text-base">
          <span v-for="day in weekDayNames"
                :key="day.short"
                class="flex h-5/6base items-center justify-center">
            <span>{{ day.short }}</span>
          </span>
        </div>
        <div class="grid grid-cols-7">
          <calendar-cell
            v-for="date in view.dates"
            :key="date.ms"
            v-bind="getModifiers(date)"
            :date="date"
            @click.native.prevent="onDateSelect(date)"
            @mouseover.native="onDateMouseOver(date)"
            @mouseout.native="onDateMouseOut"/>
        </div>
      </div>
    </div>
  </renderless-calendar>
</template>

<script>
import * as date from '../../../../lib/date'
import RenderlessCalendar from 'vue-renderless-calendar/lib/RenderlessCalendar'
import CalendarCell from './CalendarCell.vue'

export default {
  name: 'Calendar',
  components: { RenderlessCalendar, CalendarCell },

  props: {
    value: [String, Number],
    locale: String
  },

  data () {
    return {
      minDate: '',
      maxDate: '',
      disabledDates: []
    }
  },

  computed: {
    localCalendarStrings () {
      return date.getCalendarStringsForLocale(this.locale)
    },

    selectedDate () {
      let d = { month: '', year: '', string: '' }
      if (this.value) {
        const date = new Date(this.value)
        const year = date.getFullYear()
        const month = date.getMonth()
        const day = date.getDate()
        d = {
          year,
          month,
          string: `${year}-${month + 1}-${day}`
        }
      }
      return d
    }
  },

  watch: {
    value () {
      this.setMonth()
    }
  },

  mounted () {
    this.setMonth()
  },

  methods: {
    setMonth () {
      const { month, year } = this.selectedDate
      if (month) {
        // !!! DEBUG !!!
        console.log(`%c setMonth() %c month: `, 'background:#ffbb00;color:#000', 'color:#00aaff', month)
        this.$refs.calendar.setMonth({ month, year })
      }
    },

    handleDateChange (payload) {
      this.$emit('input', payload[0].ms)
    }
  }
}
</script>

<style scoped lang="scss">
  $cell-width: 40px;
  $cell-height: 40px;
  $light-gray: #f7f7f9;

  .calendar {
    &__header {
      padding: 8px 0;
      display: flex;
      justify-content: space-between;
    }

    &__weeks {
      display: flex;
      justify-content: flex-start;
    }

    &__week-day {
      display: inline-block;
      width: $cell-width;
      height: 40px;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 600;
      line-height: 40px;
    }

    &__body {
      max-width: calc(#{$cell-width} * 7);
      min-width: calc(#{$cell-width} * 7);
      justify-content: flex-start;
      display: flex;
      flex-wrap: wrap;
    }

    &__month-btn {
      background-color: $light-gray;
      color: #383838;
      border: none;
      border-radius: 3px;
      appearance: none;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      /*background-image: url('../assets/arrow-point-to-right.svg');*/
      background-size: 12px;
      background-position: center;
      background-repeat: no-repeat;
      width: 50px;
      height: 30px;

      &:first-child {
        transform: rotate(-180deg);
      }

      &:focus {
        outline: none;
        background-color: darken($light-gray, 10%);
      }
    }

  }

</style>
