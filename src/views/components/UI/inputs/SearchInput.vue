<template>
  <div class="search-input-root">
    <popper
      ref="popper"
      placement="bottom-start"
      trigger="none"
      boundaries-selector="body"
      no-arrow
      class="suggestions">
      <template v-slot:reference>
          <!--suppress HtmlFormInputWithoutLabel -->
          <input-flex
            ref="input"
            class="px-input bg-white"
            type="text"
            :placeholder="placeholder"
            :title="placeholder"
            :value="inputValue"
            @input="onInput"
            @keydown.tab.prevent="onTab"
            @focus="onFocus"
            @blur="onBlur"
            @arrow-down="nextSuggestion"
            @arrow-up="prevSuggestion"
            @enter="completeTyping"
            @keyup="getSuggestions"
            @esc="onEsc" />
      </template>
      <ul v-show="inputValue && suggestions.length" class="">
        <li v-for="(suggestion, index) in suggestions"
            :key="index"
            :class="{highlighted: index === selectedIndex}"
            class="capitalize"
            @click.prevent="selectSuggestion(suggestion)"
            @mouseover="selectedIndex = index">
          {{ suggestion.title||suggestion.displayName }}
        </li>
      </ul>
    </popper>
  </div>
</template>

<script>
import Popper from '../Popper.js.vue'
import simpleId from '../../../../lib/simpleId'
import InputFlex from './InputFlex'

export default {
  name: 'SearchInput',
  components: { InputFlex, Popper },
  props: {
    value: { type: String, default: '' },
    query: { type: Function, required: true },
    sortFunc: {
      type: Function,
      default: (a, b) => {
        const strA = (a.title || a.displayName).toLowerCase()
        const strB = (b.title || b.displayName).toLowerCase()
        if (strA < strB) return -1
        if (strA > strB) return 1
        return 0
      }
    },
    placeholder: { type: String, default: '' },
    focusOnLoad: Boolean,
    suggestionActivationThreshold: { type: Number, default: 1 },
    maxSuggestionsNumber: { type: Number, default: 0 }
  },

  data: () => ({
    inputValue: '',
    oldInputValue: '',
    suggestions: [],
    selectedIndex: -1
  }),

  computed: {
    searchResult () {
      if (!this.suggestions.length) return null
      return this.selectedIndex >= 0
        ? this.suggestions[this.selectedIndex]
        : this.suggestions
    },

    output () {
      return this.inputValue ? { search: this.inputValue, result: this.searchResult } : null
    },

    inputId () {
      return simpleId()
    },

    showSuggestions () {
      return this.suggestions && this.suggestions.length > 0
    }
  },

  watch: {
    value (value) {
      this.inputValue = value
    },
    suggestions (value) {
      if (!value || !value.length) {
        this.closeSaggestionsTimeout = setTimeout(() => {
          this.$refs.popper.showPopper = false
        }, 1000)
      } else {
        clearTimeout(this.closeSaggestionsTimeout)
        if (!this.$refs.popper.showPopper) {
          this.$nextTick(() => {
            this.$refs.popper.showPopper = true
          })
        }
      }
    }
  },

  created () {
    this.inputValue = this.value
  },

  mounted () {
    if (this.focusOnLoad) this.$refs.input.focus()
    // this.$refs.popper.showPopper = true
  },

  methods: {
    onClick (str) {
      console.log(`!!! CLICK ${str} !!!`)
    },
    getSuggestions () {
      if (this.oldInputValue !== this.inputValue ||
        (!this.suggestions.length && this.suggestionActivationThreshold === 0)
      ) {
        // this.suggestions = []
        this.selectedIndex = -1
        let inputValue = this.inputValue.trim()
        if ((inputValue.length && inputValue.length >= this.suggestionActivationThreshold) || this.suggestionActivationThreshold === 0) {
          const task = this.query(inputValue)
          if (task && task.then) {
            task.then(records => {
              this.suggestions = records.sort(this.sortFunc)
              if (this.maxSuggestionsNumber > 0) {
                this.suggestions = this.suggestions.slice(0, this.maxSuggestionsNumber)
              }
            })
          }
        }
        this.oldInputValue = this.inputValue
      }
    },

    selectSuggestion (record) {
      this.inputValue = record.title || record.displayName
      this.completeTyping()
    },

    completeTyping () {
      const result = this.searchResult
      if (result) {
        const value = typeof result === 'string'
          ? result
          : !Array.isArray(result) && (result.title || result.displayName)
            ? result.title || result.displayName
            : ''
        if (value) this.inputValue = value
      }
      this.$emit('input', this.output)
      this.clearSuggestions()
      // this.$refs.input.blur()
    },

    onFocus () {
      this.getSuggestions()
    },

    onBlur () {
      this.$emit('blur', { ...this.output })
      this.inputValue = ''
      this.hideSuggestions()
    },

    onInput (value) {
      this.inputValue = value
      // this.$emit('typing', this.inputValue)
    },

    onTab () {
      this.$emit('tab', { ...this.output })
      this.hideSuggestions()
    },

    onEsc () {
      if (this.suggestions.length) {
        this.clearSuggestions()
      } else {
        this.clear()
        this.blur()
        this.$emit('esc')
      }
    },

    hideSuggestions () {
      if (!this.inputValue) {
        this.$nextTick(() => {
          this.clearSuggestions()
        })
      }
    },

    nextSuggestion () {
      if (this.selectedIndex + 1 <= this.suggestions.length - 1) {
        this.selectedIndex++
      } else {
        this.selectedIndex = -1
      }
    },

    prevSuggestion () {
      if (this.selectedIndex > -1) {
        this.selectedIndex--
      }
    },

    clearSuggestions () {
      this.suggestions = []
      this.selectedIndex = -1
    },

    clear () {
      this.clearSuggestions()
      this.inputValue = ''
    },

    focus () {
      this.$refs.input.focus()
    },

    blur () {
      this.$refs.input.blur()
      this.$emit('blur')
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .suggestions {
    .popper-trigger {
      @apply block h-full;
    }
    .popper {
      padding: 0;
      border: #ccc solid;
      border-width: 0 1px 1px 1px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      box-shadow: 0 -1px 0 blue;

      .popper-content {
        max-height: 20rem;
        @apply block overflow-auto w-full h-full;
      }

      li {
        @apply px-base py-sm text-sm whitespace-no-wrap;
        &.highlighted {
          @apply text-aba-blue bg-gray-100;
        }
      }
    }
  }
</style>
