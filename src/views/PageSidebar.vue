<template>
  <div class="page-sidebar">
    <section>
      <profile-cell
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"
        class="mb-base"/>
    </section>
    <smooth-reflow>
      <section v-if="tags">
        <div v-for="tag in tags" :key="tag.id" class="bg-aba-blue text-white">{{tag.title}}</div>
        <post-cell v-for="tagPost in tagPosts" :key="tagPost.id" :post="tagPost" />
      </section>
    </smooth-reflow>
  </div>
</template>

<script>
import ProfileCell from './components/ProfileCell'

export default {
  name: 'PageSidebar',
  components: { ProfileCell },
  props: {},

  data: () => ({}),

  computed: {},

  methods: {}
}
</script>

<style lang="scss">
  .page-sidebar {
  }
</style>
