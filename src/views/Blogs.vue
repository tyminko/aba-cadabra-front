<template>
  <div class="blogs" role="main">
    <h1 class="text-2xl font-bold mb-6">Blog Posts</h1>

    <div
      v-if="loading"
      class="loading-state text-center p-lg"
      role="status"
      aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <span>Loading blog posts...</span>
    </div>

    <div
      v-else-if ="!orderedBlogs.length"
      class="empty-state text-center p-lg"
      role="status"
      aria-live="polite">
      No blog posts available
    </div>

    <div
      v-else
      class="grid pt-lg"
      role="feed"
      aria-label="Blog posts">
      <article
        v-for="blog in orderedBlogs"
        :key="blog.id"
        class="blog-box relative"
        :aria-labelledby="`blog-title-${blog.id}`">
        <post-cell :post="blog" />
        <button
          v-if="adminOrEditor"
          class="edit-button absolute top-0 right-0 compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
          @click="openEditor(blog)"
          :aria-label="`Edit ${blog.title}`">
          <i class="material-icons text-base cursor-pointer" aria-hidden="true">edit</i>
        </button>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import type { Store } from 'vuex'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import type { Firestore, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PostCell from './components/PostCell.vue'

interface BlogPost {
  id: string
  title: string
  createdAt: Date | string
  type: 'blog'
  status: 'public' | 'draft'
  [key: string]: any
}

interface User {
  role: 'admin' | 'editor' | 'user'
  [key: string]: any
}

interface RootState {
  user: User | null
}

const store = useStore<RootState>()
const blogs = ref<BlogPost[]>([])
const loading = ref(true)
let unsubscribe: (() => void) | null = null

const user = computed(() => store.state.user)
const adminOrEditor = computed(() =>
  user.value && (user.value.role === 'admin' || user.value.role === 'editor')
)

const orderedBlogs = computed(() =>
  [...blogs.value].sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
    return dateB.getTime () - dateA.getTime ()
  })
)

const subscribeToBlogs = (): void => {
  const blogsQuery = query(
    collection(db as Firestore, 'posts'),
    where('type', '==', 'blog'),
    where('status', '==', 'public'),
    orderBy('createdAt', 'desc')
  )

  unsubscribe = onSnapshot(
    blogsQuery,
    querySnapshot => {
      querySnapshot.docChanges ().forEach(docChange => {
        const doc = docChange.doc as QueryDocumentSnapshot<DocumentData>
        const data = doc.data ()
        const blogData: BlogPost = {
          id: doc.id,
          title: data.title || '',
          createdAt: data.createdAt || new Date (),
          type: 'blog',
          status: data.status || 'public',
          ...data
        }

        switch (docChange.type) {
          case 'added':
            blogs.value.push(blogData)
            break
          case 'modified':
            const index = blogs.value.findIndex(blog => blog.id === doc.id)
            if (index !== -1) {
              blogs.value.splice(index, 1, blogData)
            }
            break
          case 'removed':
            blogs.value = blogs.value.filter(blog => blog.id !== doc.id)
            break
        }
      })
      loading.value = false
    },
    error => {
      console.error('Error fetching blogs:', error)
      blogs.value = []
      loading.value = false
    })
}

const openEditor = (post: BlogPost): void => {
  store.dispatch('showEditor', {
    type: 'blog',
    value: post
  })
}

onMounted(() => {
  subscribeToBlogs ()
})

onUnmounted(() => {
  if (typeof unsubscribe === 'function') unsubscribe ()
})

defineOptions({
  name: 'BlogList'
})
</script>

<style lang="scss" scoped>
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
      transition: opacity 0.2s ease-in-out;
      &:focus {
        opacity: 1;
        outline: 2px solid var(--aba-blue);
        outline-offset: 2px;
      }
    }
    &:hover {
      .edit-button {
        opacity: 1;
      }
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--gray-200);
    border-top-color: var(--aba-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
