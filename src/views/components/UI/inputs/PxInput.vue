<template>
  <label class="px-label">
    <span v-if="labelText" :class="labelVisible ? 'opacity-1' : 'opacity-0'">
      {{labelText}}
    </span>
    <textarea v-if="type === `textarea`"
              ref="input"
              v-model="model"
              v-input-auto-width="autoWidthOptions"
              :placeholder="placeholderText"
              class="px-input box-content"
              @focus="onFocus"
              @blur="onBlur">
    </textarea>
    <input v-else
           ref="input"
           :type="type"
           v-model="model"
           v-input-auto-width="autoWidthOptions"
           :placeholder="placeholderText"
           class="px-input"
           @focus="onFocus"
           @blur="onBlur">
  </label>
</template>

<script>
import inputAutoWidth from 'vue-input-autowidth'

export default {
  name: 'PxInput',
  directives: { inputAutoWidth },
  props: {
    value: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    label: String
  },

  data: () => ({
    defaultMinWidth: 96,
    defaultComfortZone: 12,
    minWidth: 240
  }),

  computed: {
    model: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },

    autoWidthOptions () {
      return {
        maxWidth: '100%',
        minWidth: `${this.minWidth}px`,
        comfortZone: this.type === 'textarea' ? 0 : this.defaultComfortZone
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

  mounted () {
    this.minWidth = this.placeholderWidth()
  },

  watch: {
    placeholder () {
      this.minWidth = this.placeholderWidth()
    }
  },

  methods: {
    focus () {
      this.$refs.input.focus()
    },

    onFocus () {
      this.$el.classList.add('focus')
    },

    onBlur () {
      this.$el.classList.remove('focus')
    },

    placeholderWidth () {
      if (!this.$refs.input) return
      const val = this.$refs.input.value
      this.$refs.input.value = this.placeholder
      const { width } = window.getComputedStyle(this.$refs.input)
      this.$refs.input.value = val
      return width || this.defaultMinWidth
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="css">
  .px-label { @apply block mb-base; }
  .px-label  span {
    @apply block pl-sm text-xs text-gray-600 capitalize transition-opacity duration-100;
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
