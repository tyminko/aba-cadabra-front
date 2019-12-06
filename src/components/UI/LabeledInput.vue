<template>
  <label class="labeled-input">
    {{ label }}
    <input v-model="inputValue">
  </label>
</template>

<script>
export default {
  name: 'LabeledInput',
  props: {
    label: { type: String, required: true },
    type: { type: String, default: 'text' },
    value: { type: [Number, String], default: null }
  },
  computed: {
    inputValue: {
      get () {
        return this.value
      },

      set (newValue) {
        this.$emit('input', newValue)
      }
    }
  }
}
</script>

<style lang="scss">
  .labeled-input {
    display: block;
  }
</style>
