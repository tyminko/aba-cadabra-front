<template>
  <div class="edit-button-badge flex items-center">
    <div
      v-if="postStatus !== 'public'"
      class="block px-sm py-xs text-sm top-0 right-0 capitalize"
      :class="[postStatus]">
      {{postStatus}}
    </div>
    <button
      v-if="allowEdit"
      class="compact"
      @click="$emit('open-editor')">
      <i class="material-icons text-base">edit</i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'EditButtonBadge',
  props: {
    allowEdit: { type: Boolean, required: true },
    postStatus: String
  },

  data: () => ({}),

  computed: {},

  methods: {}
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .edit-button-badge {
    .internal {
      @apply bg-gray-900 text-white;
    }
    .draft {
      @apply bg-aba-blue text-white;
    }
  }
</style>
