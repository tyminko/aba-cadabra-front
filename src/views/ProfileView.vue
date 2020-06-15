<template>
  <content-with-sidebar class="profile">
    <template v-slot:main>
      <div class="text-block relative">
        <h1 class="text-5xl mt-sm">{{displayName}}</h1>
        <h2 v-if="positionStr" class="mt-sm">{{positionStr}}</h2>
      </div>
      <div class="text-block mt-base" v-html="description" />
    </template>
  </content-with-sidebar>
</template>

<script>
import { db } from '../lib/firebase'
import ContentWithSidebar from './components/UI/layouts/ContentWithSidebar'
import { formatPeriod } from '../lib/date'
import DOMPurify from 'dompurify'

export default {
  name: 'ProfileView',
  components: { ContentWithSidebar },
  props: {},

  data: () => ({
    unsubscribe: {},
    profile: null
  }),

  computed: {
    profileId () { return this.$route.params.id },
    displayName () { return (this.profile || {}).displayName },
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
    description () {
      if ((this.profile || {}).description) {
        return DOMPurify.sanitize(this.profile.description)
      }
      return ''
    }
  },

  created () {
    this.subscribeProfile()
  },

  watch: {
    profileId () {
      this.subscribeProfile()
    }
  },
  beforeDestroy () {
    Object.values(this.unsubscribe).forEach(unsub => {
      if (typeof unsub === 'function') unsub()
    })
  },

  methods: {
    subscribeProfile () {
      if (!this.profileId) return
      this.unsubscribe.profile = db.collection('profiles')
        .doc(this.profileId)
        .onSnapshot(
          snapshot => {
            this.profile = snapshot.data()
          },
          err => {
            console.error(`%c SUBSCRIBE PROFILE ERROR%c: `, 'background:#ff0000;color:#000', 'color:#00aaff', err)
          })
    }
  }
}
</script>

<style lang="scss">
  .profile-view {
  }
</style>