<template>
  <label class="px-label" :class="{error}">
    <span v-if="labelText" class="label" :class="labelVisible ? 'opacity-1' : 'opacity-0'">
      {{labelText}}
    </span>
    <span class="flex items-center">
      <slot>
        <input-flex
          ref="input"
          v-model="model"
          :type="type"
          :placeholder="placeholderText"
          :autocomplete="autocomplete"
          :disabled="disabled"
          :spellcheck="!noSpellcheck"
          :min-width="minWidth"
          :class="{error}"
          class="px-input"
          @focus="onFocus"
          @blur="onBlur"
          @enter="onChange"
          @change="onChange"/>
      </slot>
      <slot name="add-on" />
    </span>
    <smooth-reflow>
      <span v-if="showError && errorText" class="block px-sm mt-sm text-xs leading-tight text-red-700">{{errorText}}</span>
      <span v-else-if="haveDescription" ref="desc" class="desc block px-sm text-xs leading-none text-gray-500">
        <slot name="desc"/>
      </span>
    </smooth-reflow>
  </label>
</template>

<script>
import InputFlex from './InputFlex'
import SmoothReflow from '../SmoothReflow'

export default {
  name: 'PxInput',
  components: { SmoothReflow, InputFlex },
  props: {
    value: [String, Number],
    type: { type: String, default: 'text' },
    placeholder: [String, Number],
    label: [String, Number],
    autocomplete: String,
    disabled: Boolean,
    required: Boolean,
    noSpellcheck: Boolean,
    minWidth: { type: [String, Number], default: 200 },
    lazy: Boolean,
    rules: { type: Array, default: () => ([]) }, // a list of functions which return true or error message
    error: [String, Boolean]
  },

  data: () => ({
    lazyValue: '',
    lazyDelay: 10000,
    lazyTimeout: null,
    clearErrorTimeout: null,
    validationError: '',
    showError: false
  }),

  computed: {
    model: {
      get () {
        return this.value
      },
      set (val) {
        this.lazyValue = val
        this.validate(val)
        if (this.lazy) {
          clearTimeout(this.lazyTimeout)
          this.lazyTimeout = setTimeout(() => {
            this.$emit('input', val)
            this.lazyValue = ''
          }, this.lazyDelay)
        } else {
          this.$emit('input', val)
        }
      }
    },

    labelText () {
      return this.label || this.placeholder || ''
    },

    placeholderText () {
      return this.placeholder || this.label || ''
    },

    labelVisible () {
      return !!this.lazyValue
    },

    errorText () {
      // !!! DEBUG !!!
      console.log(`%c errorText() %c this.error: `, 'background:#ff0000;color:#000', 'color:#00aaff', this.error)
      return this.validationError || (this.error && typeof this.error === 'string' ? this.error : '')
    },

    isValid () { return !this.validationError },

    haveDescription () {
      return !!this.$slots.desc
    }
  },

  mounted () {
    this.lazyValue = this.value
  },

  watch: {
    value (val) {
      this.lazyValue = val
    },
    error (val) {
      // !!! DEBUG !!!
      console.log(`%c error() %c val: `, 'background:#ffbb00;color:#000', 'color:#00aaff', val)
      console.log(`%c error() %c this.validationError: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.validationError)
      if (!this.validationError) this.showError = !!val
      // !!! DEBUG !!!
      console.log(`%c error() %c this.showEditor: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.showEditor)
    }
  },

  methods: {
    focus () {
      this.$refs.input.focus()
    },

    onFocus () {
      this.$el.classList.add('focus')
      this.clearErrorTimeout = setTimeout(() => { this.showError = false }, 1000)
    },

    onBlur () {
      clearTimeout(this.clearErrorTimeout)
      this.showError = this.validate(this.value)
      this.$el.classList.remove('focus')
      this.$emit('blur')
    },

    onChange () {
      if (this.lazy) {
        clearTimeout(this.lazyTimeout)
        this.$emit('input', this.lazyValue)
        this.lazyValue = ''
      }
      this.$emit('change', this.lazyValue)
    },

    validate (val) {
      this.validationError = ''
      if (this.required && !val) {
        this.validationError = 'required'
        return false
      }
      if ((this.rules || []).length) {
        for (const rule of this.rules) {
          const res = rule(val)
          if (res !== true) {
            this.validationError = res
            break
          }
        }
      }
      return !!this.validationError
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="css">
  .px-label { @apply block mb-8; }
  .px-label  span.label {
    @apply block relative -mb-1 pl-sm text-xs text-gray-600 capitalize transition-opacity duration-100;
  }
  .px-label.focus > .label { @apply text-aba-blue; }
  .px-label.error > .label { @apply text-red-500; }
  .px-label.error.focus > .label{ @apply text-red-700; }

  .px-input {
    @apply h-2/3base py-0 px-sm border-aba-blue-semi border-b;
    /*noinspection CssInvalidFunction*/
    max-width: calc(100% - theme('padding.sm') * 2) !important;
    text-overflow: ellipsis;
  }
  .px-input::placeholder {
    @apply italic capitalize font-light text-gray-400;
  }
  .px-input.error {
    @apply text-aba-blue border-red-300;
  }
  .px-input.error::placeholder {
    @apply text-red-400;
  }
  .px-input:focus { @apply text-aba-blue border-aba-blue; }
  .px-input.error { @apply text-red-500 border-red-500; }
  .px-input.error:focus { @apply text-red-700 border-red-600; }

  .px-label.xl .px-input { @apply h-base text-2xl; }
  .px-label.lg .px-input { @apply h-3/4base text-xl; }
</style>
