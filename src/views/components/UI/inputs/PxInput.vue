<template>
  <label class="px-label">
    <span v-if="labelText" :class="labelVisible ? 'opacity-1' : 'opacity-0'">
      {{labelText}}
    </span>
    <input-flex ref="input"
                :type="type"
                v-model="model"
                :placeholder="placeholderText"
                min-width="200"
                class="px-input"
                @focus="onFocus"
                @blur="onBlur"/>
  </label>
</template>

<script>
import InputFlex from './InputFlex'

export default {
  name: 'PxInput',
  components: { InputFlex },
  props: {
    value: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    label: String
  },

  data: () => ({}),

  computed: {
    model: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },

    labelText () {
      return this.label || this.placeholder || ''
    },

    placeholderText () {
      return this.placeholder || this.label || ''
    },

    labelVisible () {
      return !!this.model
    }
  },

  mounted () {},

  watch: {},

  methods: {
    focus () {
      this.$refs.input.focus()
    },

    onFocus () {
      this.$el.classList.add('focus')
    },

    onBlur () {
      this.$el.classList.remove('focus')
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="css">
  .px-label { @apply block mb-6; }
  .px-label  span {
    @apply block relative -mb-2 pl-sm text-xs text-gray-600 capitalize transition-opacity duration-100 z-10;
  }
  .px-label.focus > span { @apply text-aba-blue; }

  .px-input {
    @apply h-2/3base py-0 px-sm border-aba-blue-semi border-b;
    /*noinspection CssInvalidFunction*/
    max-width: calc(100% - theme('padding.sm') * 2) !important;
    text-overflow: ellipsis;
  }

  .px-input::placeholder {
    @apply italic capitalize font-light text-gray-400;
  }
  .px-input:focus { @apply text-aba-blue border-aba-blue; }

  .px-label.xl .px-input { @apply h-base text-xl; }
</style>
