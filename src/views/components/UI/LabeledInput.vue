<template>
  <label class="labeled-input" :for="inputId">
    {{ label }}
    <input
      v-model="inputValue"
      :id="inputId"
      :type="type"
      :aria-label="label">
  </label>
</template>

<script setup>
import { useId } from '../../../composables/useId'

const props = defineProp({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  value: { type: [Number, String], default: null }
})

const emit = defineEmit(['input'])

const inputId = useId('labeled-input')

const inputValue = computed({
  get: () => props.value,
  set: (newValue) => emit('input', newValue)
})
</script>

<style lang="scss">
  .labeled-input {
    display: block;
  }
</style>
