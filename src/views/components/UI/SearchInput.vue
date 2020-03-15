<template>
  <div class="search-input-root">
    <popper
      ref="popper"
      placement="bottom-start"
      no-arrow
      :options="{
        modifiers: { offset: { offset: '0,0' } }
      }"
      trigger="click"
      class="popper-wrap">
      <div slot="reference" class="popper-ref input-wrapper">
        <!--suppress HtmlFormInputWithoutLabel -->
        <input
          ref="input"
          v-model="inputValue"
          :placeholder="placeholder"
          :title="placeholder"
          type="text"
          @blur="onBlur"
          @keydown.tab.prevent="onTab"
          @focus="onFocus"
          @input="onInput"
          @keydown.8="onBackspace"
          @keydown.down="nextSuggestion"
          @keydown.up="prevSuggestion"
          @keydown.enter.prevent="completeTyping"
          @keyup.exact="getSuggestions"
          @keyup.esc="onEsc">
      </div>
      <ul v-show="inputValue && suggestions.length" class="popper dropdown suggestions secondary">
        <li v-for="(suggestion, index) in suggestions"
            :key="index"
            :class="{highlighted: index === selectedIndex}"
            @mousedown.prevent="selectSuggestion(suggestion)"
            @mouseover="selectedIndex = index">
          {{ suggestion.title||suggestion.displayName }}
        </li>
      </ul>
    </popper>
  </div>
</template>

<script>
import Popper from './Popper.js'

export default {
  name: 'SearchInput',
  components: { Popper },
  props: {
    value: { type: String, default: '' },
    query: { type: Function, required: true },
    sortFunc: {
      type: Function,
      default: (a, b) => {
        if (a.title < b.title) return -1
        if (a.title > b.title) return 1
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
      // !!! DEBUG !!!
      console.log(`%c searchResult() %c this.suggestions: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.suggestions)
      if (!this.suggestions.length) return null
      return this.selectedIndex >= 0
        ? this.suggestions[this.selectedIndex]
        : this.suggestions
    },

    output () {
      return this.inputValue ? { search: this.inputValue, result: this.searchResult } : null
    }
  },

  watch: {
    value (value) {
      this.inputValue = value
    },
    suggestions (value) {
      this.$refs.popper.showPopper = value.length > 0
    }
  },

  created () {
    this.inputValue = this.value
  },

  mounted () {
    if (this.focusOnLoad) this.$refs.input.focus()
  },

  methods: {
    getSuggestions () {
      if (this.oldInputValue !== this.inputValue || (!this.suggestions.length && this.suggestionActivationThreshold === 0)) {
        this.suggestions = []
        this.selectedIndex = -1
        let inputValue = this.inputValue.trim()
        if ((inputValue.length && inputValue.length >= this.suggestionActivationThreshold) || this.suggestionActivationThreshold === 0) {
          const task = this.query(inputValue)
          if (task && task.then) {
            task.then(records => {
              this.suggestions = records.sort(this.sortFunc)
              // Shorten Search results to desired length
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
      this.$refs.input.blur()
    },

    onFocus () {
      this.getSuggestions()
    },

    onBlur () {
      this.$emit('blur', { ...this.output })
      this.hideSuggestions()
    },

    onInput (e) {
      this.inputValue = e.target.value
      this.$emit('typing', this.inputValue)
    },

    onTab () {
      this.$emit('tab', { ...this.output })
      this.hideSuggestions()
    },

    onBackspace () {
      // TODO: should we use some cache to avoid firing search query on character delete if we have already searched the string while typing??
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
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .search-input-root {
    position: relative;
    width: 100%;
    //z-index: $z-high;
    overflow: visible !important;

    .input-wrapper {
      position: relative;
      margin: 0;

      input {
        border: none;
        box-shadow: none;
        display: block;
        width: 100%;
        margin: 0;

        &:focus {
          border: none;
          box-shadow: none;
          display: block;
        }
      }
    }

    .popper.dropdown {
      @apply block py-sm px-0 text-left m-0;

      li {
        @apply p-sm whitespace-no-wrap;

        &.highlighted {
          @apply bg-gray-400;
        }
      }

      .popper__arrow {
        display: none;
      }
    }
  }
</style>
