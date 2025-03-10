<template>
  <div
    class="credits-string"
    :class="{ 'inline': inline }">
    <span
      v-if="prefix"
      class="font-light text-gray-700">
      {{ `${prefix} ` }}
    </span>
    <span
      v-for="(person, i) in persons"
      :key="person.id"
      class="person-name">
      <span
        v-if="noLink || !person.id"
        :class="{ 'font-medium': person.star }">
        {{ person.displayName }}
      </span>
      <router-link
        v-else
        :to="{ name: 'profile', params: { id: person.id } }"
        class="hover:text-aba-blue transition-colors"
        :class="{ 'font-medium': person.star }">
        {{ person.displayName }}
      </router-link>
      <span
        v-if="i < persons.length - 1"
        class="font-light text-gray-700"
        :class="{ 'opacity-75': !noLink }">
        {{ getSeparator(i) }}
      </span>
    </span>
    <slot name="suffix" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Prop
const props = defineProp({
  prefix: {
    type: String,
    default: ''
  },
  persons: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(person =>
        person &&
        typeof person === 'object' &&
        'displayName' in person
      )
    }
  },
  noLink: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  },
  useCommaAnd: {
    type: Boolean,
    default: false
  }
})

// Computed
const useAND = computed(() => {
  return (
    props.persons.length === 2 &&
    !props.persons.find(p => /&|(\sand\s)/.test(p.displayName))
  )
})

// Method
const getSeparator = (index) => {
  const isLastButOne = index === props.persons.length - 2

  if (props.useCommaAnd && isLastButOne) {
    return ', and '
  }

  if (useAND.value && isLastButOne) {
    return ' & '
  }

  return ', '
}
</script>

<style lang="scss" scoped>
.credits-string {
  &:not(.inline) {
    display: block;
  }

  .person-name {
    a {
      text-decoration: none;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
