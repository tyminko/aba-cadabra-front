<template>
  <div class="programme-feed">
    <h1 class="text-5xl text-aba-blue p-lg">
      {{programmeObj.title}}
    </h1>
    <aba-map :markers="markers" :zoom="12"/>
    <post-feed-grid :posts="posts" :processing="processing"/>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import PostFeedGrid from './components/PostFeedGrid'
import AbaMap from './components/UI/AbaMap'

export default {
  name: 'ProgrammeFeed',
  components: { AbaMap, PostFeedGrid },
  props: {},

  data: () => ({
    programmeId: null,
    programmeObj: {},
    feed: {},
    unsubscribe: {}
  }),

  computed: {
    posts () {
      return Object.values(this.feed).sort((a, b) => b.date - a.date)
    },
    markers () {
      return this.posts.map(post => {
        const { lat, lng } = post.location || {}
        if (lat && lng) {
          return { lat: parseFloat(lat), lng: parseFloat(lng), url: '', label: `#${post.countNumber}` }
        }
      }).filter(m => !!m).sort((a, b) => a.lat - b.lat)
    }
  },

  created () {
    this.programmeId = this.$route.params.id
    this.subscribeProgrammeRecord()
    this.subscribeFeed()
  },

  watch: {
    $route () {
      this.programmeId = this.$route.params.id
      this.unsubscribeAll()
      this.subscribeProgrammeRecord()
      this.subscribeFeed()
    }
  },

  beforeDestroy () {
    this.unsubscribeAll()
  },

  methods: {
    subscribeProgrammeRecord () {
      if (!this.programmeId) return
      this.unsubscribe.programme = db.collection('programmes')
        .doc(this.programmeId)
        .onSnapshot(doc => {
          this.programmeObj = { ...doc.data(), id: doc.id }
        })
    },

    subscribeFeed () {
      if (!this.programmeId) return
      this.processing = true
      this.unsubscribe.feed = db.collection('posts')
        .where('partOfProgramme.programmeId', '==', this.programmeId)
        .where('status', '==', 'public')
        .orderBy('date', 'desc')
        .onSnapshot({
          next: querySnapshot => {
            querySnapshot.docChanges().forEach(docChange => {
              const doc = docChange.doc
              switch (docChange.type) {
                case 'added':
                case 'modified':
                  this.$set(this.feed, doc.id, { ...doc.data(), id: doc.id })
                  break
                case 'removed':
                  this.$delete(this.feed, doc.id)
              }
            })
            this.processing = false
          },
          error: err => {
            console.error('getFeed:', err)
            this.processing = false
          }
        })
    },

    unsubscribeAll () {
      Object.values(this.unsubscribe).forEach(un => {
        if (typeof un === 'function') un()
      })
      this.feed = {}
    }
  }
}
</script>

<style lang="scss">
  @import "../styles/vars";
  #app .programme-feed {
    .aba-map {
      height: calc((100vh - #{$base-size}) * 0.4);
    }
  }
</style>
