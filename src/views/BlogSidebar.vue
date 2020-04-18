<template>
  <div class="blog-sidebar">
    <section>
      <div class="desc">Author</div>
      <h2>{{authorName}}</h2>
      <div v-html="description"/>
    </section>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import DOMPurify from 'dompurify'

export default {
  name: 'BlogSidebar',
  props: {
    author: { type: Object, default: () => ({}) }
  },

  data: () => ({
    authorProfile: null,
    profileUnsubscribe: null
  }),

  computed: {
    authorName () {
      return (this.author || {}).displayName
    },
    description () {
      return DOMPurify.sanitize((this.authorProfile || {}).description || '')
    }
  },

  created () {
    this.subscribeAuthorProfile()
  },

  beforeDestroy () {
    if (typeof this.profileUnsubscribe === 'function') {
      this.profileUnsubscribe()
    }
  },

  methods: {
    subscribeAuthorProfile () {
      if (!(this.author || {}).uid) return
      this.profileUnsubscribe = db.collection('profiles').doc(this.author.uid)
        .onSnapshot(doc => {
          this.authorProfile = { ...doc.data() }
        })
    }
  }
}
</script>

<style lang="scss">
  .blog-sidebar {
    width: 240px;
  }
</style>
