<template>
  <div class="credits-string">
    <span v-if="prefix" class="font-light text-gray-700">{{`${prefix} `}}</span>
    <span v-for="(person, i) in persons" :key="person.id">
      <router-link :to="{ name: 'profile', params: { id: person.id } }">{{person.displayName}}</router-link>
      <span
        v-if="i < persons.length - 1"
        class="font-light text-gray-700">{{useAND ? ' & ' : ', '}}</span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'CreditsString',
  props: {
    prefix: String,
    persons: { type: Array, required: true }
  },
  computed: {
    useAND () {
      return this.persons.length === 2 && !this.persons.find(p => /&|(\sand\s)/.test(p.displayName))
    }
  }
}
</script>
