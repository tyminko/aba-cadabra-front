<template>
  <content-with-sidebar class="profile">
    <template v-slot:main>
      <div class="text-block relative">
        <h1 class="text-5xl mt-sm">{{displayName}}</h1>
        <h2 v-if="positionStr" class="mt-sm">{{positionStr}}</h2>
      </div>
      <attachments-view :attachments="attachments" />
      <div class="text-block mt-base" v-html="text" />
    </template>
    <template v-slot:sidebar>
      <profile-sidebar :profile="profile"/>
    </template>
  </content-with-sidebar>
</template>

<script>
import { db } from '../lib/firebase'
import { formatPeriod } from '../lib/date'
import DOMPurify from 'dompurify'
import ContentWithSidebar from './components/UI/layouts/ContentWithSidebar'
import ProfileSidebar from './ProfileSidebar'
import AttachmentsView from './components/AttachmentsView'

export default {
  name: 'ProfileView',
  components: { AttachmentsView, ProfileSidebar, ContentWithSidebar },
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
    text () {
      return DOMPurify.sanitize((this.profile || {}).text || (this.profile || {}).description || '')
    },
    attachments () {
      return (this.profile || {}).attachments || {}
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
            this.profile = { uid: this.profileId, ...snapshot.data() }
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
