<template>
  <label class="px-label" :class="{error}">
    <span v-if="labelText" class="label" :class="labelVisible ? 'opacity-1' : 'opacity-0'">
      {{labelText}}
    </span>
    <span class="flex items-center">
      <slot>
        <input-flex
          ref="input"
          :type="type"
          v-model="model"
          :placeholder="placeholderText"
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
    <span v-if="errorText" class="px-sm text-xs text-red-700">{{errorText}}</span>
    <div v-else-if="haveDescription" ref="desc" class="desc px-sm text-xs text-gray-500">
      <slot name="desc"/>
    </div>
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
    label: String,
    minWidth: { type: [String, Number], default: 200 },
    error: [String, Boolean],
    lazy: Boolean
  },

  data: () => ({
    lazyValue: '',
    lazyDelay: 10000,
    lazyTimeout: null
  }),

  computed: {
    model: {
      get () {
        return this.value
      },
      set (val) {
        this.lazyValue = val
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
      return !!this.model
    },

    errorText () {
      return this.error && typeof this.error === 'string' ? this.error : ''
    },

    haveDescription () {
      return !!this.$slots.desc
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
      // if (this.lazy) {
      //   clearTimeout(this.lazyTimeout)
      //   this.$emit('input', this.lazyValue)
      //   this.lazyValue = ''
      // }
      this.$emit('blur')
    },

    onChange () {
      if (this.lazy) {
        // !!! DEBUG !!!
        console.log(`%c PxInput lazy onChange %c this.lazyValue: `, 'background:#00bbff;color:#000', 'color:#00aaff', this.lazyValue)
        clearTimeout(this.lazyTimeout)
        this.$emit('input', this.lazyValue)
        this.lazyValue = ''
      }
      this.$emit('change', this.lazyValue)
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="css">
  .px-label { @apply block mb-6; }
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

  .px-label.xl .px-input { @apply h-base text-xl; }
</style>
