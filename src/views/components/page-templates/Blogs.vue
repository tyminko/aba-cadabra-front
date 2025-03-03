<template>
  <div class="blogs">
    <h1>Blog Posts</h1>
    <div class="grid pt-lg">
      <div 
        v-for="blog in orderedBlogs" 
        :key="blog.id" 
        class="blog-box relative">
        <post-cell :post="blog" />
        <button
          v-if="adminOrEditor"
          class="edit-button absolute top-0 right-0 compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
          @click="openEditor(blog)">
          <i class="material-icons text-base cursor-pointer">edit</i>
        </button>
      </div>
    </div>
    <div v-if="loading" class="loading-state text-center p-lg">
      Loading...
    </div>
    <div v-if="!loading && !orderedBlogs.length" class="empty-state text-center p-lg">
      No blog posts available
    </div>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import PostCell from './components/PostCell'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Blogs',
  components: {
    PostCell
  },

  data: () => ({
    blogs: [],
    loading: true,
    unsubscribe: null
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    orderedBlogs () {
      return [...this.blogs].sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
    }
  },

  created () {
    this.subscribeToBlogs()
  },

  methods: {
    ...mapActions(['showEditor']),
    subscribeToBlogs () {
      this.unsubscribe = db.collection('posts')
        .where('type', '==', 'blog')
        .where('status', '==', 'public')
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          querySnapshot => {
            querySnapshot.docChanges().forEach(docChange => {
              const doc = docChange.doc
              const blogData = { ...doc.data(), id: doc.id }
              
              switch (docChange.type) {
                case 'added':
                  this.blogs.push(blogData)
                  break
                case 'modified':
                  const index = this.blogs.findIndex(blog => blog.id === doc.id)
                  if (index !== -1) {
                    this.blogs.splice(index, 1, blogData)
                  }
                  break
                case 'removed':
                  this.blogs = this.blogs.filter(blog => blog.id !== doc.id)
                  break
              }
            })
            this.loading = false
          },
          error => {
            console.error('Error fetching blogs:', error)
            this.blogs = []  // Clear the blogs array on error
            this.loading = false
          })
    },

    openEditor (post) {
      this.showEditor({
        type: 'blog',
        value: post
      })
    }
  },

  beforeDestroy () {
    if (typeof this.unsubscribe === 'function') this.unsubscribe()
  }
}
</script>

<style lang="scss">
.blogs {
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-auto-rows: auto;
    grid-auto-flow: dense;
    gap: 32px;
    max-width: 100%;
  }

  .blog-box {
    .edit-button {
      opacity: 0;
      transition: opacity 0.2s;
    }
    &:hover {
      .edit-button {
        opacity: 1;
      }
    }
  }
}
</style> 