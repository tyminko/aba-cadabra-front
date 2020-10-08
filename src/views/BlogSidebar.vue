<template>
  <div class="blog-sidebar">
    <section>
      <div class="desc mb-base">Author</div>
      <profile-cell
        :profile="authorProfile"
        class="mb-base"/>
    </section>
    <section v-if="authorEvents.length">
      <div v-for="event in authorEvents" :key="event.id" class="mt-base">
        <post-cell :post="event" />
      </div>
    </section>
    <smooth-reflow>
      <section v-if="tags">
        <div v-for="tag in tags" :key="tag.id" class="bg-aba-blue text-white mt-base">{{tag.title}}</div>
        <post-cell v-for="tagPost in tagPosts" :key="tagPost.id" :post="tagPost" />
      </section>
    </smooth-reflow>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import { makeExcerpt } from '../lib/string'
import PostCell from './components/PostCell'
import SmoothReflow from './components/UI/SmoothReflow'
import ProfileCell from './components/ProfileCell'

export default {
  name: 'BlogSidebar',
  components: { ProfileCell, SmoothReflow, PostCell },
  props: {
    author: { type: Object, default: () => ({}) },
    post: { type: Object, default: () => ({}) }
  },

  data: () => ({
    authorProfile: null,
    authorEvents: [],
    tagPosts: [],
    profileUnsubscribe: null
  }),

  computed: {
    authorName () {
      return (this.author || {}).displayName
    },
    thumbnailUrl () {
      if (!this.authorProfile || !this.authorProfile.attachments) return
      const post = this.authorProfile
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
      return makeExcerpt((this.authorProfile || {}).description || (this.authorProfile || {}).text)
    },

    tags () {
      return (this.post || {}).tags || []
    }
  },

  created () {
    this.subscribeAuthorProfile()
    this.getAuthorEvents()
    this.getTagPosts()
  },

  watch: {
    author () {
      this.subscribeAuthorProfile()
      this.getAuthorEvents()
    },
    post () {
      this.getTagPosts()
    }
  },

  beforeDestroy () {
    if (typeof this.profileUnsubscribe === 'function') {
      this.profileUnsubscribe()
    }
  },

  methods: {
    subscribeAuthorProfile () {
      if (!(this.author || {}).uid) {
        this.authorProfile = null
        return
      }
      this.profileUnsubscribe = db.collection('profiles').doc(this.author.uid)
        .onSnapshot(doc => {
          this.authorProfile = { ...doc.data() }
        })
    },
    getAuthorEvents () {
      if (!(this.author || {}).uid) {
        this.authorEvents = []
        return
      }
      const { displayName, uid: id } = this.author
      db.collection('posts')
        .where('type', '==', 'event')
        .where('status', '==', 'public')
        .where('participants', 'array-contains', { displayName, id })
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.authorEvents.push({ ...doc.data(), id: doc.id })
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
    }
  }
}
</script>

<style lang="scss">
  @import "../styles/mixins";
  .excerpt {
    @include multi-line-truncate(5);
  }
</style>
