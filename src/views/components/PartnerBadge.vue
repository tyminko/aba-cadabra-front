<template>
  <div class="partner-badge">
    <div class="logo-box p-sm">
      <img v-if="institute.logo" :src="logoUrl(institute)"/>
    </div>
    <div class="">
      <a class="block text-sm leading-tight" :href="institute.url">{{value.title}}, {{value.country}}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PartnerBadge',
  props: {
    value: { type: Object, required: true }
  },
  data: () => ({}),
  computed: {},
  methods: {}
}
</script>

<style lang="scss">
  .partner-badge {
  }
</style>
