<template>
  <div class="work">
    <section class="content">
      <img v-for="(attachment, i) in worData.attachments" :key="i" :src="attachment.full.url">
    </section>
    <footer>
      <div>{{ workData.title }}</div>
      <nav>NAV</nav>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Work',
  components: {
  },

  props: {
    workData: { type: Object, required: true }
  },

  data: () => ({
  }),

  computed: {
  },

  methods: {
  }
}
</script>

<style lang='scss'>
  .work{
  position: relative;
  }
</style>
