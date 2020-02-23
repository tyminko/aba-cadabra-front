<template>
  <input :type="type"
         v-model="model"
         v-input-auto-width="autoWidthOptions"
         :placeholder="placeholder"
         @focus="$emit('focus')"
         @blur="$emit('blur')">
</template>

<script>
import inputAutoWidth from 'vue-input-autowidth'

export default {
  name: 'InputFlex',
  directives: { inputAutoWidth },
  props: {
    value: [String, Number],
    placeholder: String,
    type: { type: String, default: 'text' },
    minWidth: { type: [String, Number], default: 0 },
    comfortZone: { type: [String, Number], default: 12 }
  },

  data: () => ({
    defaultMinWidth: 96,
    actualMinWidth: 0
  }),

  computed: {
    model: {
      get () { return this.value },
      set (val) { this.$emit('input', val) }
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
    async placeholder () {
      this.actualMinWidth = this.minWidth || await this.placeholderWidth()
    }
  },

  async mounted () {
    this.actualMinWidth = this.minWidth || await this.placeholderWidth()
  },

  methods: {
    focus () {
      this.$el.focus()
    },

    async placeholderWidth () {
      if (!this.$el) return
      const test = document.createElement('span')
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
      test.style.left = 9000
      test.innerText = this.placeholder
      test.id = 'test-width-f'
      document.body.appendChild(test)
      await this.$nextTick()
      const width = test.offsetWidth
      // test.remove()
      return parseInt(width) || this.defaultMinWidth
    }
  }
}
</script>
