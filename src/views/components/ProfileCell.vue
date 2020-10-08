<template>
  <div class="profile-cell">
    <router-link :to="{name: 'profile', params: {id: (this.profile||{}).id}}">
      <header class="flex">
        <div class="avatar flex-shrink-0 flex-grow-0 w-base h-base rounded-full overflow-hidden bg-gray-200 mr-sm">
          <img
            v-if="thumbnailUrl"
            :src="thumbnailUrl"
            class="w-full h-full object-cover"
            alt="team member portrait">
        </div>
        <div class="person-info flex-grow">
          <h2>{{displayName}}</h2>
          <div class="desc">{{positionStr}}</div>
        </div>
      </header>
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
      const firstVisualAttachment = Object.values(post.attachments)
        .sort((a, b) => a.order - b.order)
        .find(attachment => {
          return (attachment.type || '').startsWith('image/') ||
          attachment.srcSet.hasOwnProperty('full') ||
          attachment.srcSet.hasOwnProperty('preview')
        })
      if (firstVisualAttachment) {
        src = firstVisualAttachment.srcSet
      }
      if (!src) return ''
      const originalIsImage = (firstVisualAttachment.type || '').startsWith('image/')
      const { full, preview, original } = src
      return (preview || full || (originalIsImage ? original : null) || {}).url
    },

    description () {
      return makeExcerpt((this.profile || {}).text || (this.profile || {}).description)
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
    .avatar {
    }
  }
</style>
