<template>
  <div class="profile-cell">
    <router-link :to="{name: 'profile', params: {id: this.profile.id}}"><h2>{{displayName}}</h2>
      <div class="desc">{{positionStr}}</div>
      <!--    <img v-if="thumbnailUrl" :src="thumbnailUrl" class="mb-sm">-->
      <div class="excerpt mt-sm text-sm">{{description}}...</div>
    </router-link>
  </div>
</template>

<script>
import { makeExcerpt } from '../../lib/string'
import { formatPeriod } from '../../lib/date'

export default {
  name: 'ProfileCell',
  props: {
    profile: { type: Object }
  },

  data: () => ({}),

  computed: {
    displayName () {
      return (this.profile || {}).displayName
    },

    positionStr () {
      const profile = (this.profile || {})
      const position = profile.abaPosition || ''
      switch (position) {
        case 'resident':
          return 'Residency: ' + formatPeriod(profile.residencyStart, profile.residencyEnd, 'en')
        case 'guest':
          return ''
        default :
          return position
      }
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
  @import "../../styles/mixins";
  .profile-cell {
    .excerpt {
      @include multi-line-truncate(3);
    }
  }
</style>
