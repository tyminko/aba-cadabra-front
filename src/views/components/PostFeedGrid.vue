<template>
  <div class="post-feed-grid">
    <template v-if="!posts.length">
      <div class="flex items-center justify-center">
        <div v-if="processing" class="text-aba-blue">Loading...</div>
        <div v-else>Nothing there</div>
      </div>
    </template>
    <template v-else>
      <div v-for="post in posts" :key="post.id" class="post-item">
        <post-cell
          :post="post"
          :without-quick-edit="withoutQuickEdit"
          @click="openPostModal(post)"
        />
        <popper
          v-if="!withoutQuickEdit"
          ref="popper"
          trigger="none"
          :placement="'right'"
          :position="popperPos"
          :force-show="!!editingPost && editingPost.id === post.id"
          @created="onPopperCreated">
          <post-editor-palette
            :post="editingPost"
            :processing="processing"
            @close="closeEditor"
            @save="savePost"
            @remove="removePost"/>
        </popper>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import PostCell from './PostCell.vue'
import Popper from './UI/Popper.js.vue'
import PostEditorPalette from '../editor/PostEditorPalette.vue'
import { db } from '../../lib/firebase'

defineOptions({
  name: 'PostFeedGrid'
})

export interface AbaPost {
  id: string
  title: string
  excerpt?: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  category?: string
  author?: string
  createdAt: Date | string
  featured?: boolean
  type: string
  status?: string
  [key: string]: any
}

interface Props {
  posts: AbaPost[]
  withoutQuickEdit?: boolean
  processing?: boolean
}

const props = withDefault(defineProps<Props>(), {
  withoutQuickEdit: false,
  processing: false
})

const store = useStore ()
const popper = ref<InstanceType<typeof Popper> | null>(null)
const editingPost = ref<AbaPost | null>(null)
const popperPos = ref({ x: 0, y: 0 })

const openPostModal = (post: AbaPost) => {
  window.history.replaceState({}, '', `/${post.type}/${post.id}`)
  store.dispatch('openPost', { type: post.type, value: post.id })
}

const onPopperCreated = () => {
  // Handle popper creation
}

const closeEditor = () => {
  editingPost.value = null
}

const savePost = async (post: AbaPost) => {
  try {
    const collectionRef = collection(db, post.type)
    const docRef = doc(collectionRef, post.id)
    await updateDoc(docRef, post)
    closeEditor ()
  } catch (error) {
    console.error('Error saving post:', error)
  }
}

const removePost = async (post: AbaPost) => {
  try {
    const collectionRef = collection(db, post.type)
    const docRef = doc(collectionRef, post.id)
    await deleteDoc(docRef)
    closeEditor ()
  } catch (error) {
    console.error('Error removing post:', error)
  }
}

watch(() => props.processing, (val) => {
  if (!val) store.dispatch('setContentLoaded')
})
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  @import "../../styles/mixins";

  .post-feed-grid {
    $min-col-w: 200px;
    $gap-w: 24px;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax($min-col-w, 1fr));
    grid-auto-rows: 320px;
    grid-auto-flow: dense;
    grid-gap: $gap-w;
    @apply p-lg;
    max-width: 100%;

    .post-item {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.02);
      }
    }
  }
</style>
