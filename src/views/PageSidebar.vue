<template>
  <div class="page-sidebar">
    <section v-if="relatedProfilesIds.length">
      <h3>{{sections.profiles}}</h3>
      <profile-cell
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"
        class="mb-base"/>
    </section>
    <section v-if="tags">
      <h3>{{sections.tags}}</h3>
<!--      <div v-for="tag in tags" :key="tag.id" class="bg-aba-blue text-white">{{tag.title}}</div>-->
      <post-cell v-for="tagPost in tagPosts" :key="tagPost.id" :post="tagPost" />
    </section>
  </div>
</template>

<script>
import ProfileCell from './components/ProfileCell'
import { db, FieldPath } from '../lib/firebase'
import PostCell from './components/PostCell'

export default {
  name: 'PageSidebar',
  components: { PostCell, ProfileCell },
  props: {
    post: { type: Object, default: () => ({}) },
    sections: {
      type: Object,
      default: () => ({ profiles: 'Persons mentioned', tags: 'Similar Posts' })
    }
  },

  data: () => ({
    profiles: [],
    tagPosts: []
  }),

  computed: {
    relatedProfilesIds () {
      return ((this.post || {}).relatedPeople || []).map(p => p.id)
    },
    tags () {
      return (this.post || {}).tags || []
    }
  },

  created () {
    this.subscribeRelatedProfiles()
    this.getTagPosts()
  },

  watch: {
    post () {
      this.subscribeRelatedProfiles()
      this.getTagPosts()
    }
  },

  beforeDestroy () {
    if (typeof this.profileUnsubscribe === 'function') {
      this.profileUnsubscribe()
    }
  },

  methods: {
    subscribeRelatedProfiles () {
      this.profiles = []
      if (!this.relatedProfilesIds.length) return
      db.collection('profiles')
        .where(FieldPath.documentId(), 'in', this.relatedProfilesIds)
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
      const get = (collectionName) => {
        return db.collection(collectionName)
          .where('status', '==', 'public')
          .where('tagIds', 'array-contains-any', tagIds)
          .get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              this.tagPosts.push({ ...doc.data(), id: doc.id })
            })
          })
      }
      this.tagPosts = []
      return Promise.all([get('posts'), get('pages')])
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .page-sidebar {
    h3 {
      @apply mb-sm text-aba-blue;
    }
  }
</style>
