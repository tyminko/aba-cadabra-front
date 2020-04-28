<template>
  <div class="profile-cell">
    <h2 class="">{{authorName}}</h2>
    <img v-if="thumbnailUrl" :src="thumbnailUrl" class="mb-sm">
    <div class="excerpt mt-sm text-sm">{{description}}...</div>
  </div>
</template>

<script>
import { makeExcerpt } from '../../lib/string'

export default {
  name: 'ProfileCell',
  props: {
    profile: { type: Object }
  },

  data: () => ({}),

  computed: {
    authorName () {
      return (this.profile || {}).displayName
    },
    thumbnailUrl () {
      if (!this.profile || !this.profile.attachments) return
      const post = this.profile
      let src = null
      const firstVisualAttachment = Object.values(post.attachments).find(attachment => {
        return (attachment.type || '').startsWith('image/') ||
          attachment.srcSet.hasOwnProperty('full') ||
          attachment.srcSet.hasOwnProperty('preview')
      })
      if (firstVisualAttachment) {
        src = firstVisualAttachment.srcSet
      }
      if (!src) return ''
      const { full, preview, original } = src
      return (preview || full || original || {}).url
    },

    description () {
      return makeExcerpt((this.profile || {}).description || (this.profile || {}).text)
    }
  },

  methods: {}
}
</script>

<style lang="scss">
  .profile-cell {
  }
</style>
