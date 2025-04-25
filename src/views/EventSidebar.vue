<template>
  <div class="event-sidebar">
    <section v-if="showMap">
      <aba-map
        v-if="latLng"
        ref="map"
        :markers="mapMarkers"
        class="mb-base"/>
    </section>
    <section>
      <profile-cell
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"
        class="mb-base"/>
    </section>
    <section v-if="authorEvents.length">
      <div v-for="event in authorEvents" :key="event.id">
        <post-cell :post="event" />
      </div>
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
import { db, FieldPath } from '../lib/firebase'
import PostCell from './components/PostCell'
import SmoothReflow from './components/UI/SmoothReflow'
import ProfileCell from './components/ProfileCell'
import { abaMapStyle } from '../lib/map'
import AbaMap from './components/UI/AbaMap'

export default {
  name: 'EventSidebar',
  components: { AbaMap, ProfileCell, SmoothReflow, PostCell },
  props: {
    post: { type: Object, default: () => ({}) },
    showMap: Boolean
  },

  data: () => ({
    profiles: [],
    authorEvents: [],
    tagPosts: [],
    profileUnsubscribe: null,
    mapOptions: {
      disableDefaultUI: true,
      backgroundColor: '#fff',
      styles: [...abaMapStyle.basic]
    }
  }),

  computed: {
    persons () {
      if (!(this.post || {}).participants) return []
      return this.post.participants
    },

    tags () {
      return (this.post || {}).tags || []
    },

    participantsIds () {
      return ((this.post || {}).participants || []).map(p => p.id)
    },

    latLng () {
      if (!(this.post || {}).location) return null
      const { lat, lng } = this.post.location
      // !!! DEBUG !!!
      console.log(`%c latLng() %c lat, lng: `, 'background:#ffbb00;color:#000', 'color:#00aaff', lat, lng)
      return { lat: parseFloat(lat), lng: parseFloat(lng) }
    },

    mapMarkers () {
      return this.latLng ? [{ ...this.latLng, label: `#${this.post.countNumber}`, url: 'this.post' }] : []
    }
  },

  created () {
    this.subscribeParticipantsProfiles()
    // this.getAuthorEvents()
    this.getTagPosts()
  },

  watch: {
    author () {
      // this.getAuthorEvents()
    },
    post () {
      this.subscribeParticipantsProfiles()
      this.getTagPosts()
    }
  },

  beforeDestroy () {
    if (typeof this.profileUnsubscribe === 'function') {
      this.profileUnsubscribe()
    }
  },

  methods: {
    subscribeParticipantsProfiles () {
      this.profiles = []
      if (!this.participantsIds.length) return
      db.collection('profiles')
        .where(FieldPath.documentId(), 'in', this.participantsIds)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.profiles.push({ ...doc.data(), id: doc.id })
          })
        })
    },

    getTagPosts () {
      const tagIds = (this.post || {}).tagIds || []
      if (!tagIds.length) {
        this.tagPosts = []
        return
      }
      db.collection('posts')
        .where('status', '==', 'public')
        .where('tagIds', 'array-contains-any', tagIds)
        .get()
        .then(snapshot => {
          const posts = []
          snapshot.forEach(doc => {
            posts.push({ ...doc.data(), id: doc.id })
          })
          return posts
        })
        .then(posts => {
          this.tagPosts = posts.filter(post => {
            return post.type === 'event' ||
              post.author.uid !== (((this.post || {}).author || {}).uid || this.author.uid)
          })
        })
    },

    stopEventPropagation: function () {
      var anchor = this.anchor
      anchor.style.cursor = 'auto';
      ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
        'pointerdown']
        .forEach(function (event) {
          anchor.addEventListener(event, function (e) {
            e.stopPropagation()
          })
        })
    }
  }
}
</script>

<style lang="scss">
  @import "../styles/mixins";
  .excerpt {
    @include multi-line-truncate(3);
  }
</style>
