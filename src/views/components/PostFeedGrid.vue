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
        :post="post">
        <template v-slot:quick-edit-button="{cellSize}">
          <template v-if="withoutQuickEdit">
            <a class="button edit-button compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue ml-auto" @click.prevent="openEditor(post)">
              <i class="material-icons text-base cursor-pointer">edit</i>
            </a>
          </template>
          <template v-else>
            <popper
              v-if="adminOrEditor || post.author.uid === (user || {}).uid"
              placement="right"
              class="ml-auto">
              <template v-slot:reference="{show}">
              <span
                class="button edit-button compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
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
    withoutQuickEdit: { type: Boolean, default: false },
    processing: Boolean
  },

  data: () => ({}),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  watch: {
    processing () {
      if (!this.processing) this.setContentLoaded()
    }
  },

  methods: {
    ...mapActions(['showEditor', 'openPost', 'setContentLoaded']),
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
      // !!! DEBUG !!!
      console.log(`%c openPostModal() %c this.$route.path: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.$route.path)
      window.history.replaceState({}, '', `/${post.type}/${post.id}`)
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
  }
</style>
