<template>
  <!--suppress HtmlFormInputWithoutLabel -->
  <input
    :type="type"
    v-model="model"
    v-input-auto-width="autoWidthOptions"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :spellcheck="spellcheck"
    @click="focus"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
    @change="$emit('change')"
    @keydown.down="$emit('arrow-down')"
    @keydown.up="$emit('arrow-up')"
    @keydown.enter.prevent="$emit('enter')"
    @keyup.exact="$emit('keyup')"
    @keydown.esc="onEsc">
</template>

<script>
import inputAutoWidth from 'vue-input-autowidth'

export default {
  name: 'InputFlex',
  directives: { inputAutoWidth },
  props: {
    value: [String, Number],
    autocomplete: String,
    disabled: Boolean,
    spellcheck: Boolean,
    placeholder: [String, Number],
    type: { type: String, default: 'text' },
    minWidth: { type: [String, Number], default: 0 },
    comfortZone: { type: [String, Number], default: 0 }
  },

  data: () => ({
    tempValue: '',
    defaultMinWidth: 96,
    actualMinWidth: 0,
    testId: 'input-flex-test-width-span'
  }),

  computed: {
    model: {
      get () { return this.tempValue },
      set (val) {
        this.tempValue = val
        this.$emit('input', val)
      }
    },
    autoWidthOptions () {
      return {
        maxWidth: '100%',
        minWidth: `${parseInt(this.actualMinWidth) + parseInt(this.comfortZone) + 2}px`, // "+ 2" is a magical number added by vue-input-autowidth
        comfortZone: parseInt(this.comfortZone)
      }
    }
  },

  watch: {
    value (val) {
      this.tempValue = val
    },
    async placeholder () {
      this.actualMinWidth = this.minWidth || await this.placeholderWidth()
    }
  },

  async mounted () {
    this.tempValue = this.value
    this.actualMinWidth = this.minWidth || await this.placeholderWidth()
  },

  methods: {
    focus () {
      this.$el.focus()
    },

    blur () {
      this.$el.blur()
    },

    onEsc (e) {
      e.stopImmediatePropagation()
      this.$emit('esc')
    },

    async placeholderWidth () {
      if (!this.$el) return
      const test = document.getElementById(this.testId) || document.createElement('span')
      const style = window.getComputedStyle(this.$el)
      ;(['fontFamily',
        'fontKerning',
        'fontOpticalSizing',
        'fontSize',
        'fontStretch',
        'fontStyle',
        'fontVariant',
        'fontVariantLigatures',
        'fontVariantCaps',
        'fontVariantNumeric',
        'fontVariantEast-asian',
        'fontWeight',
        'letterSpacing',
        'padding',
        'textIndent',
        'textTransform',
        'whiteSpace',
        'wordBreak',
        'wordSpacing']).forEach(prop => {
        test.style[prop] = style[prop]
      })
      test.style.position = 'absolute'
      test.style.left = '-9000px'
      test.innerText = this.placeholder
      test.id = this.testId
      document.body.appendChild(test)
      await this.$nextTick()
      const width = test.offsetWidth
      return parseInt(width) || this.defaultMinWidth
    }
  },
  beforeDestroy () {
    const test = document.getElementById(this.testId)
    if (test) test.parentNode.removeChild(test)
  }
}
</script>
