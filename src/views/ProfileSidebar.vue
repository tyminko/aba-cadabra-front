<template>
  <div class="profile-sidebar">
    <section>
      <post-cell :post="blogPost" />
    </section>
    <section v-if="authorEventsStarred.length">
      <div v-for="event in authorEventsStarred" :key="event.id" class="mt-base">
        <post-cell :post="event" />
      </div>
    </section>
    <section v-if="authorEvents.length">
      <div v-for="event in authorEvents" :key="event.id" class="mt-base">
        <post-cell :post="event" />
      </div>
    </section>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import PostCell from './components/PostCell'

export default {
  name: 'ProfileSidebar',
  components: { PostCell },
  props: {
    profile: { type: Object, default: () => ({}) }
  },

  data: () => ({
    authorEventsStarred: [],
    authorEvents: [],
    blogPost: {}
  }),

  computed: {},

  created () {
    this.getAuthorEventsStarred()
    this.getAuthorEvents()
    this.getLatestBlogPost()
  },

  watch: {
    profile () {
      this.getAuthorEventsStarred()
      this.getAuthorEvents()
      this.getLatestBlogPost()
    }
  },

  methods: {
    getLatestBlogPost () {
      if (!(this.profile || {}).uid) {
        this.blogPost = {}
        return
      }
      db.collection('posts')
        .where('author.uid', '==', this.profile.uid)
        .where('type', '==', 'post')
        .where('status', '==', 'public')
        .orderBy('date', 'desc')
        .limit(1)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.blogPost = { ...doc.data(), id: doc.id }
          })
        })
    },

    getAuthorEventsStarred () {
      if (!(this.profile || {}).uid) {
        this.authorEvents = []
        return
      }
      const { displayName, uid: id } = this.profile
      db.collection('posts')
        .where('type', '==', 'event')
        .where('status', '==', 'public')
        .where('participants', 'array-contains', { displayName, id, 'star': true })
        .orderBy('date', 'desc')
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.authorEventsStarred.push({ ...doc.data(), id: doc.id })
          })
        })
    },

    getAuthorEvents () {
      if (!(this.profile || {}).uid) {
        this.authorEvents = []
        return
      }
      const { displayName, uid: id } = this.profile
      db.collection('posts')
        .where('type', '==', 'event')
        .where('status', '==', 'public')
        .where('participants', 'array-contains', { displayName, id })
        .orderBy('date', 'desc')
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.authorEvents.push({ ...doc.data(), id: doc.id })
          })
        })
    }
  }
}
</script>

<style lang="scss">
  .profile-sidebar {
  }
</style>
