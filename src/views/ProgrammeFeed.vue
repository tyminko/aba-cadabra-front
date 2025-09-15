<template>
  <div class="programme-feed">
    <h1 class="text-5xl text-aba-blue p-lg">
      {{programmeObj.title}}
    </h1>
    <div class="px-lg" v-html="description"/>
    <aba-map :markers="markers" :zoom="12"/>
    <post-feed-grid :posts="posts" :processing="processing"/>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import DOMPurify from 'dompurify'
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
          return {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            label: `#${post.countNumber}`,
            title: post.title,
            description: post.excerpt || '',
            url: post.url || '',
            id: post.id,
            token: post.token || post.id,
            active: false // for marker styling
          }
        }
      }).filter(m => !!m).sort((a, b) => a.lat - b.lat)
    },
    description () {
      if ((this.programmeObj || {}).text) {
        return DOMPurify.sanitize(this.programmeObj.text)
      }
      return ''
    }
  },

  created () {
    this.programmeId = this.$route.params.id
    console.log('ProgrammeFeed created with ID:', this.programmeId) // Debug log
    this.subscribeProgrammeRecord()
    this.subscribeFeed()
  },

  watch: {
    $route () {
      if (this.$route.name !== 'programme' || this.programmeId === this.$route.params.id) {
        // if rooter is changed by popup ... getting in or out of the popup
        return
      }
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
      console.log('Subscribing to programme record:', this.programmeId) // Debug log
      this.unsubscribe.programme = db.collection('programmes')
        .doc(this.programmeId)
        .onSnapshot(doc => {
          console.log('Programme record received:', doc.exists, doc.data()) // Debug log
          this.programmeObj = { ...doc.data(), id: doc.id }
        }, error => {
          console.error('Error fetching programme record:', error) // Debug log
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
