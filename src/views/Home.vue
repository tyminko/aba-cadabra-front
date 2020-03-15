<template>
  <div class="home">
    <div class="feed-grid">
      <post-cell
        v-for="post in feed"
        :key="post.id"
        :post="post">
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
                @open-editor="openEditor(post)"/>
            </template>
          </popper>
        </template>
      </post-cell>
    </div>
    <post-editor
      v-if="adminOrEditor && !!postToEdit"
      :open="!!postToEdit"
      :post="postToEdit"
      @close="closeEditor"/>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import { mapState } from 'vuex'
import * as date from '../lib/date'
import Ftellipsis from 'ftellipsis'
import Popper from './components/UI/Popper.js'
import PostEditorPalette from './editor/PostEditorPalette'
import PostEditor from './editor/PostEditor'
import PostCell from './components/PostCell'

export default {
  name: 'Home',
  components: { PostCell, Popper, PostEditorPalette, PostEditor },
  props: {},

  data: () => ({
    feed: {},
    unsubscribe: null,
    shouldOpenEditor: false,
    editorPostId: null,
    editorPostType: null,
    postToEdit: null
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  watch: {
  },

  mounted () {
    this.getFeed()
  },

  methods: {
    openEditor (post) {
      this.postToEdit = post
      this.shouldOpenEditor = true
    },

    closeEditor () {
      this.postToEdit = null
    },

    hasThumbnail (post) {
      if (post.thumbnail) {
        const { full, preview, original } = post.thumbnail.srcSet || post.thumbnail
        return !!full || !!preview || !!original
      }
      return false
    },

    thumbnailUrl (post) {
      let src = null
      if (post.attachments) {
        if (post.thumbnail && post.attachments.hasOwnProperty(post.thumbnail)) {
          src = post.attachments[post.thumbnail].srcSet
        } else {
          const firstVisualAttachment = Object.values(post.attachments).find(attachment => {
            return (attachment.type || '').startsWith('image/') ||
              attachment.srcSet.hasOwnProperty('full') ||
              attachment.srcSet.hasOwnProperty('preview')
          })
          if (firstVisualAttachment) {
            src = firstVisualAttachment.srcSet
          }
        }
      }
      if (!src) return ''
      const { full, preview, original } = src
      return post.cardSize
        ? (full || original || preview || {}).url
        : (preview || full || original || {}).url
    },

    thumbnailObjectPlacement (boxEl) {
      const pointOfInterest = { x: 0.2, y: 0.2 }
      const imageW = 512
      const boxW = 215
      const x = Math.min(Math.max(boxW / 2 - imageW * pointOfInterest.x, boxW - imageW), 0)
      return x + 'px'
    },

    async formatText (id) {
      if (this.$refs[`feed-text-${id}`]) {
        await this.$nextTick()
        const el = this.$refs[`feed-text-${id}`][0]
        const ellipsis = new Ftellipsis(el)
        ellipsis.calc()
        ellipsis.set()
        el.style.flexShrink = 0
      }
    },

    cellSize (id) {
      if (this.feed[id] && this.feed[id].cardSize) {
        return this.feed[id].cardSize
      }
      return ''
    },

    formatDate (timestamp) {
      return date.format(timestamp)
    },

    postType (string) {
      return string === 'post' ? 'blog' : string
    },

    setCellSize (id, size) {
      db.collection('posts').doc(id).update({
        cardSize: size
      })
    },

    getFeed () {
      this.unsubscribe = db.collection('posts')
        .where('status', '==', 'public').orderBy('date', 'desc')
        .onSnapshot(
          querySnapshot => {
            querySnapshot.forEach(async doc => {
              const feedItem = doc.data()
              this.$set(this.feed, doc.id, { ...feedItem, id: doc.id })
              // setTimeout(() => {
              //   if (this.$refs[`feed-text-${doc.id}`]) {
              //     const el = this.$refs[`feed-text-${doc.id}`][0]
              //     const ellipsis = new Ftellipsis(el)
              //     ellipsis.calc()
              //     ellipsis.set()
              //   }
              // }, 200)
            })
          },
          err => {
            console.error('getFeed:', err)
          }
        )
    }
  }
}
</script>

<style lang='scss'>
  @import "../styles/vars";
  @import "../styles/mixins";
  .home {
    .feed-grid {
      /*--popper-border-width: 4px;*/

      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-auto-rows: 320px;
      grid-gap: 24px;
      grid-auto-flow: dense;
      padding: 24px;
    }
  }
</style>
