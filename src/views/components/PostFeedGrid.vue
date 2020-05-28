<template>
  <div class="post-feed-grid">
    <template v-if="!posts.length">
      <div class="flex items-center justify-center">
        <div v-if="processing" class="text-aba-blue">Loading...</div>
        <div v-else>Nothing there</div>
      </div>
    </template>
    <template v-else>
      <post-cell
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @request-to-open="openPostModal(post)">
        <template v-slot:quick-edit-button="{cellSize}">
          <popper
            v-if="adminOrEditor"
            placement="right"
            class="ml-auto">
            <template v-slot:reference="{show}">
              <span
                class="edit-button badge w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
                :class="{active:show}">
                <i class="material-icons text-base cursor-pointer">edit</i>
              </span>
            </template>
            <template v-slot:default="{hide}">
              <post-editor-palette
                :current="cellSize"
                @close="hide"
                @set-size="setCellSize(post.id, $event)"
                @open-editor="openEditor(post)"
                @hide-post="hidePost(post)"
                @remove-post="removePost(post)"/>
            </template>
          </popper>
        </template>
      </post-cell>
    </template>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { db } from '../../lib/firebase'
import PostCell from './PostCell'
import Popper from './UI/Popper.js'
import PostEditorPalette from '../editor/PostEditorPalette'

export default {
  name: 'PostFeedGrid',
  components: { PostEditorPalette, Popper, PostCell },
  props: {
    posts: { type: Array, default: () => [] },
    processing: Boolean
  },

  data: () => ({}),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  methods: {
    ...mapActions(['showEditor', 'openPost']),
    openEditor (post) {
      this.showEditor({
        type: post.type,
        value: post
      })
    },

    openPostModal (post) {
      let value = post
      if (post.type === 'event') {

      }
      this.openPost({ type: post.type, value })
    },

    setCellSize (id, size) {
      db.collection('posts').doc(id).update({
        cardSize: size
      })
    },

    removePost (post) {
      db.collection('posts').doc(post.id).update({ status: 'trash' })
    },

    hidePost (post) {
      db.collection('posts').doc(post.id).update({ status: 'draft' })
    },

    closeEditor () {
      this.postToEdit = null
    }

  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .post-feed-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-auto-rows: 320px;
    grid-auto-flow: dense;

    @apply gap-lg p-lg;
    max-width: 100%;
  }
</style>
