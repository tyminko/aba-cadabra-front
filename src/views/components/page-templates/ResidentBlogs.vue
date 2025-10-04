<template>
  <div class="resident-blogs">
    <h1>Blogs</h1>
    <div class="grid pt-lg">
        <div
          v-for="blog in orderedResidentBlogs"
          :key="blog.id"
          class="blog-box relative">
          <div class="blog-post-with-image">
            <post-cell :post="blog" :is-recent="isRecentBlog(blog)" />
          </div>
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
    <div v-if="!loading && !orderedResidentBlogs.length" class="empty-state text-center p-lg">
      <p>No resident blog posts available</p>
      <p v-if="residents.length === 0" class="text-sm text-gray-500 mt-2">
        No residents found in database (looking for abaPosition = 'resident')
      </p>
      <p v-if="residents.length > 0 && blogs.length === 0" class="text-sm text-gray-500 mt-2">
        No blog posts found in database (checking for type='post' and status='public')
      </p>
      <p v-if="residents.length > 0 && blogs.length > 0" class="text-sm text-gray-500 mt-2">
        Found {{residents.length}} residents and {{blogs.length}} blogs, but no matches
      </p>
    </div>
  </div>
</template>

<script>
import { db } from '../../../lib/firebase'
import PostCell from '../PostCell'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'ResidentBlogs',
  components: {
    PostCell
  },

  data: () => ({
    blogs: [],
    residents: [],
    loading: true,
    unsubscribeBlogs: null,
    unsubscribeResidents: null
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    orderedResidentBlogs () {
      return [...this.blogs].sort((a, b) => {
        // Use the same date logic as the display: date || createdAt
        const dateA = a.date || a.createdAt
        const dateB = b.date || b.createdAt

        // Convert to Date objects for comparison
        const dateObjA = dateA instanceof Date ? dateA : new Date(dateA)
        const dateObjB = dateB instanceof Date ? dateB : new Date(dateB)

        // Sort by newest first (dateB - dateA)
        return dateObjB.getTime() - dateObjA.getTime()
      })
    }
  },

  created () {
    console.log('ResidentBlogs component created!')
    console.log('Firebase db object:', db)
    console.log('User:', this.user)
    this.subscribeToResidents()
    this.subscribeToBlogs()
  },

  methods: {
    ...mapActions(['showEditor']),

    subscribeToResidents () {
      this.unsubscribeResidents = db.collection('profiles')
        .where('abaPosition', '==', 'resident')
        .onSnapshot(
          querySnapshot => {
            this.residents = []
            querySnapshot.forEach(doc => {
              this.residents.push({ ...doc.data(), id: doc.id })
            })
            console.log('Fetched residents:', this.residents.length, this.residents)
            // Filter blogs after residents are loaded
            this.filterResidentBlogs()
          },
          error => {
            console.error('Error fetching residents:', error)
            this.residents = []
          }
        )
    },

    subscribeToBlogs () {
      console.log('Starting to fetch blogs...')
      // First, let's check what posts exist in the database
      db.collection('posts')
        .limit(10)
        .get()
        .then(snapshot => {
          console.log('All posts in database:', snapshot.size)
          if (snapshot.size === 0) {
            console.log('No posts found in database at all!')
          } else {
            snapshot.forEach(doc => {
              const postData = { ...doc.data(), id: doc.id }
              console.log('Post type:', postData.type, 'status:', postData.status, 'title:', postData.title)
            })
          }
        })
        .catch(error => {
          console.error('Error fetching posts:', error)
        })

      // Try a simple get() query first to test
      db.collection('posts')
        .where('type', '==', 'post')
        .where('status', '==', 'public')
        .get()
        .then(querySnapshot => {
          console.log('Blog query snapshot size:', querySnapshot.size)
          console.log('Blog query snapshot empty:', querySnapshot.empty)

          this.blogs = []
          querySnapshot.forEach(doc => {
            const blogData = { ...doc.data(), id: doc.id }
            console.log('Blog found:', blogData.title, blogData.type, blogData.status)
            this.blogs.push(blogData)
          })

          console.log('Fetched blogs:', this.blogs.length, this.blogs)
          // Filter blogs after blogs are loaded
          this.filterResidentBlogs()
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching blogs:', error)
          this.blogs = []
          this.loading = false
        })

      // Set up real-time listener
      this.unsubscribeBlogs = db.collection('posts')
        .where('type', '==', 'post')
        .where('status', '==', 'public')
        .onSnapshot(
          querySnapshot => {
            console.log('Real-time blog query snapshot size:', querySnapshot.size)

            querySnapshot.docChanges().forEach(docChange => {
              const doc = docChange.doc
              const blogData = { ...doc.data(), id: doc.id }
              console.log('Real-time blog doc change:', docChange.type, blogData.title)

              switch (docChange.type) {
                case 'added':
                  if (!this.blogs.find(blog => blog.id === doc.id)) {
                    this.blogs.push(blogData)
                  }
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
            this.filterResidentBlogs()
          },
          error => {
            console.error('Error in real-time blog query:', error)
          }
        )
    },

    filterResidentBlogs () {
      console.log('Filtering blogs - residents:', this.residents.length, 'blogs:', this.blogs.length)

      if (this.residents.length === 0 || this.blogs.length === 0) {
        console.log('No residents or blogs to filter')
        this.loading = false
        return
      }

      // Create a set of resident UIDs for efficient lookup
      const residentUids = new Set(this.residents.map(resident => resident.id))
      console.log('Resident UIDs:', Array.from(residentUids))

      // Filter blogs to only include those written by residents
      const residentBlogs = this.blogs.filter(blog => {
        const isResidentBlog = blog.author && residentUids.has(blog.author.uid)
        if (isResidentBlog) {
          console.log('Resident blog found:', blog.title, 'by', blog.author.displayName)
        }
        return isResidentBlog
      })
      console.log('Total resident blogs found:', residentBlogs.length)

      // Group blogs by author and keep only the most recent one from each author
      const blogsByAuthor = {}
      residentBlogs.forEach(blog => {
        const authorUid = blog.author.uid
        const blogDate = blog.date || blog.createdAt || 0

        if (!blogsByAuthor[authorUid] || blogDate > (blogsByAuthor[authorUid].date || blogsByAuthor[authorUid].createdAt || 0)) {
          blogsByAuthor[authorUid] = blog
        }
      })

      // Convert back to array
      this.blogs = Object.values(blogsByAuthor)
      console.log('Filtered blogs from', residentBlogs.length, 'to', this.blogs.length, 'unique authors')
      console.log('Final blogs array length:', this.blogs.length)
      if (this.blogs.length > 0) {
        console.log('First few final blogs:', this.blogs.slice(0, 3).map(blog => ({
          title: blog.title,
          author: blog.author && blog.author.displayName,
          uid: blog.author && blog.author.uid
        })))
      }
      this.loading = false
    },

    openEditor (post) {
      this.showEditor({
        type: 'post',
        value: post
      })
    },

    getBlogImages (blog) {
      if (!blog || !blog.attachments) return []

      const images = []
      const attachmentIds = Object.keys(blog.attachments)

      for (const id of attachmentIds) {
        const attachment = blog.attachments[id]
        if (attachment && attachment.type && attachment.type.startsWith('image/')) {
          // Get the best available image URL
          let imageUrl = null
          let caption = attachment.caption || ''

          if (attachment.srcSet) {
            // Prefer full size, then original, then preview
            if (attachment.srcSet.full && attachment.srcSet.full.url) {
              imageUrl = attachment.srcSet.full.url
            } else if (attachment.srcSet.original && attachment.srcSet.original.url) {
              imageUrl = attachment.srcSet.original.url
            } else if (attachment.srcSet.preview && attachment.srcSet.preview.url) {
              imageUrl = attachment.srcSet.preview.url
            } else if (typeof attachment.srcSet === 'string') {
              imageUrl = attachment.srcSet
            }
          }

          // Fallback to other properties
          if (!imageUrl) {
            if (attachment.large) imageUrl = attachment.large
            else if (attachment.medium) imageUrl = attachment.medium
            else if (attachment.small) imageUrl = attachment.small
            else if (attachment.url) imageUrl = attachment.url
          }

          if (imageUrl) {
            images.push({
              id: id,
              url: imageUrl,
              caption: caption,
              dimensions: attachment.dimensions || {}
            })
          }
        }
      }

      return images
    },

    isRecentBlog (blog) {
      if (!blog.date && !blog.createdAt) return false
      const blogDate = new Date(blog.date || blog.createdAt)
      const now = new Date()
      const daysDiff = (now - blogDate) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7 // Highlight blogs from the last 7 days
    }

  },

  beforeDestroy () {
    if (typeof this.unsubscribeBlogs === 'function') this.unsubscribeBlogs()
    if (typeof this.unsubscribeResidents === 'function') this.unsubscribeResidents()
  }
}
</script>

<style lang="scss">
.resident-blogs {
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

        .loading-state, .empty-state {
          color: #6b7280;
          font-style: italic;
        }

        .blog-post-with-image {
        }
      }
</style>
