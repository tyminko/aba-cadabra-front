<template>
  <div class="date-time-picker">
    <div :id="id" class="flex items-center">
      <px-input
        v-model="dateString"
        :label="label"
        :error="!!error"
        @blur="onBlur"
        min-width="95">
        <template v-slot:add-on>
          <popper
            ref="calendar-popper"
            boundaries-selector="body"
            :boundaries-padding="10"
            @toggle="calendarIsOpen=$event">
            <template v-slot:reference>
              <button class="w-2/3base h-2/3base" @click="preventDefault">
                <i class="material-icons">event</i>
              </button>
            </template>
            <calendar v-model="model" locale="de"/>
          </popper>
        </template>
      </px-input>
      <px-input
        v-model="timeString"
        placeholder="00:00"
        label="Time"
        min-width="50"
        @blur="onBlur"/>
    </div>
    <div :class="{error}" class="dec px-sm -mt-10 mb-base text-xs text-gray-500 whitespace-no-wrap truncate">
      {{error || dateFull}}
    </div>
  </div>
</template>

<script>
import simpleID from '../../../../lib/simpleID'
import * as date from '../../../../lib/date'
import { DateTime } from 'luxon'
import Popper from '../Popper.js'
import PxInput from './PxInput'
import Calendar from '../calendar/Calendar'

export default {
  name: 'DateTimePicker',
  components: { Popper, PxInput, Calendar },
  props: {
    value: { type: [String, Number] },
    required: Boolean,
    label: String
  },

  data: () => ({
    id: simpleID(),
    tempDateString: '',
    tempTimeString: '',
    check: '',
    error: '',
    lazyParsedValue: '',
    lazyDelay: 5000,
    lazyTimeout: null,
    calendarIsOpen: false,
    defaultDateFormat: date.getShortFormatForLocale().replace(/L/g, 'M').toUpperCase()
  }),

  computed: {
    dateFull () {
      return this.lazyParsedValue
        ? date.format(this.lazyParsedValue, 'full')
        : this.tempDateString
          ? date.format(this.model, 'full')
          : ''
    },

    dateString: {
      get () {
        return this.tempDateString
      },
      set (newValue) {
        clearTimeout(this.lazyTimeout)
        this.tempDateString = newValue
        if (!newValue) {
          this.error = ''
          if (this.required) {
            this.lazyParsedValue = DateTime.local()
          }
        } else {
          const parsed = date.parse(newValue.trim())
          if (parsed) {
            const { hour, minute } = DateTime.fromMillis(this.model).toObject()
            this.lazyParsedValue = parsed.set({ hour, minute })
            this.error = ''
          } else {
            this.lazyParsedValue = ''
            this.error = `Try this format: ${this.defaultDateFormat} (${date.format(DateTime.local())})`
          }
        }
        this.lazyTimeout = setTimeout(() => {
          if (this.lazyParsedValue) {
            this.model = this.lazyParsedValue.toMillis()
            this.lazyParsedValue = ''
          }
        }, this.lazyDelay)
      }
    },

    timeString: {
      get () { return this.tempTimeString },
      set (newValue) {
        this.tempTimeString = newValue
        clearTimeout(this.lazyTimeout)
        const parsed = date.parseTime(newValue.trim())
        if (parsed) {
          this.lazyParsedValue = (this.lazyParsedValue || DateTime.fromMillis(this.model)).set(parsed)
          this.error = ''
        }
        this.lazyTimeout = setTimeout(() => {
          if (this.lazyParsedValue) {
            this.model = this.lazyParsedValue.toMillis()
            this.lazyParsedValue = ''
          }
        }, this.lazyDelay)
      }
    },

    model: {
      get () {
        return this.value
      },
      set (newValue) {
        this.$emit('input', newValue)
      }
    }
  },

  watch: {
    value (value) {
      this.updateValues()
    }
  },

  created () {
    this.updateValues()
  },

  methods: {
    updateValues () {
      if (!this.value && this.required) this.value = DateTime.local().toMillis()
      this.error = ''
      this.tempDateString = this.value ? date.format(this.value) : this.value
      this.tempTimeString = this.value ? date.formatTime(this.value) : this.value
    },

    onEsc () {
      if (this.calendarIsOpen && this.$refs['calendar-popper']) {
        this.$refs['calendar-popper'].hide()
        return true
      }
    },

    onBlur () {
      clearTimeout(this.lazyTimeout)
      if (this.lazyParsedValue) {
        this.$emit('input', this.lazyParsedValue.toMillis())
        this.lazyParsedValue = ''
      }
    },

    preventDefault (e) {
      e.preventDefault()
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .date-time-picker {
    .error { @apply text-red-500; }
  }
</style>
