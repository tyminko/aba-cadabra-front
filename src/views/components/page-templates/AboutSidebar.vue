<template>
  <div class="page-sidebar">
    <section v-if="profiles.length">
      <h3>{{sections.profiles}}</h3>
      <draggable-content v-model="orderedProfiles" :disabled="!isAdmin">
        <profile-cell
          v-for="profile in orderedProfiles"
          :key="profile.id"
          :profile="profile"
          class="mb-base"/>
      </draggable-content>
    </section>
    <section v-if="tags.length">
      <h3>{{sections.tags}}</h3>
<!--      <div v-for="tag in tags" :key="tag.id" class="bg-aba-blue text-white">{{tag.title}}</div>-->
      <post-cell v-for="tagPost in tagPosts" :key="tagPost.id" :post="tagPost" />
    </section>
  </div>
</template>

<script>
import { db } from '../../../lib/firebase'
import { mapState } from 'vuex'
import ProfileCell from '../../components/ProfileCell'
import PostCell from '../../components/PostCell'
import DraggableContent from '../UI/DraggableContent'

export default {
  name: 'AboutSidebar',
  components: { DraggableContent, PostCell, ProfileCell },
  props: {
    post: { type: Object, default: () => ({}) },
    sections: {
      type: Object,
      default: () => ({ profiles: 'Team members', tags: 'Similar Posts' })
    }
  },

  data: () => ({
    profiles: [],
    tagPosts: []
  }),

  computed: {
    ...mapState(['user']),
    isAdmin () { return (this.user || {}).role === 'admin' },
    orderedProfiles: {
      get () {
        return [...this.profiles].sort((a, b) => a.teamOrder - b.teamOrder)
      },
      set (newValue) {
        const profilesRef = db.collection('profiles')
        this.profiles = [...newValue]
        newValue.forEach((prof, i) => {
          this.$set(this.profiles[i], 'teamOrder', i)
          if (this.isAdmin) profilesRef.doc(prof.id).update({ teamOrder: i })
        })
      }
    },
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
      db.collection('profiles')
        .where('teamOrder', '>', -1)
        .orderBy('teamOrder', 'asc')
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
