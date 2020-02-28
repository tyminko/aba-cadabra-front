<template>
  <button
    class="calendar-cell h-5/6base w-5/6base flex items-center justify-center text-sm whitespace-no-wrap"
    :class="rootClasses">
    <span>{{ date.day }}</span>
  </button>
</template>

<script>
export default {
  name: 'CalendarCell',
  inheritAttrs: false,
  props: {
    date: {
      required: true,
      type: Object
    },
    selectedDates: {
      type: Array
    },
    isSelected: {
      default: false,
      type: Boolean
    },
    isDisabled: {
      default: false,
      type: Boolean
    },
    isBetween: {
      default: false,
      type: Boolean
    },
    isOneDayBefore: {
      default: false,
      type: Boolean
    },
    isOneDayAfter: {
      default: false,
      type: Boolean
    },
    isLast: {
      default: false,
      type: Boolean
    },
    isFirst: {
      default: false,
      type: Boolean
    },
    isOneDayBeforeFirst: {
      default: false,
      type: Boolean
    },
    isOneDayBeforeLast: {
      default: false,
      type: Boolean
    }
  },
  computed: {
    rootClasses () {
      return {
        '--is-other-month-day': this.date.isOtherMonthDay,
        '--selected': this.isSelected,
        '--weekend': this.date.isWeekend,
        '--disabled': this.isDisabled,
        '--between': this.isBetween,
        '--first': this.isFirst,
        '--last': this.isLast,
        '--one-day-before': this.isOneDayBefore,
        '--one-day-after': this.isOneDayAfter,
        '--one-day-before-first': this.isOneDayBeforeFirst,
        '--one-day-before-last': this.isOneDayBeforeLast
      }
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style scoped lang="scss">
  .calendar-cell {
    transition: font-size 0.05s, background-color 0.1s;
    &:active {
      @apply rounded-none text-aba-blue text-xl;
    }
    &:not(.--disabled):not(.--selected):hover {
      /*@apply text-base;*/
    }
    &.--disabled:not(.--between) {
      opacity: .1;
    }
    &.--between {
      @apply bg-aba-blue-semi rounded-none;
    }
    &.--weekend {
      @apply text-aba-blue;
    }
    &.--selected {
      @apply text-white relative text-xl bg-aba-blue;
    }
    &.--is-other-month-day:not(.--disabled):not(.--between):not(.--selected) {
      @apply text-shadow;
    }
    &:focus:not(.--selected) {
    }
    &.--between:focus {
    }
  }
</style>
