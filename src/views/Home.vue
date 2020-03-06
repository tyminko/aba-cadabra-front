<template>
  <div class="home">
    <div class="feed-grid">
      <div v-for="(post, id) in feed"
           :key="post.postId"
           ref="feed-items"
           :class="cellSize(id)"
           class="cell break-words flex flex-col">
        <header class="flex-grow-0">
          <div class="flex flex-align-center">
            <div class="badge mr-2 bg-gray-200">{{postType(post.postType)}}</div>
            <popper v-if="adminOrEditor"
                    placement="right"
                    class="ml-auto">
              <template v-slot:reference="{show}">
                <span class="edit-button badge w-8 text-gray-600 hover:text-aba-blue"
                      :class="{active:show}">
                  <i class="material-icons text-base cursor-pointer">edit</i>
                </span>
              </template>
              <template v-slot:default="{hide}">
                <post-editor-palette
                  :current="cellSize(id)"
                  @close="hide"
                  @set-size="setCellSize(id, $event)"
                  @open-editor="openEditor(post.postType, post.postId)"/>
              </template>
            </popper>
          </div>
          <h1 class="mt-1">{{post.title}}</h1>
          <div class="mt-1">{{formatDate(post.date)}}</div>
        </header>
        <div
          v-if="post.thumbnail && post.thumbnail.mime.startsWith('image')"
          class="thumbnail-box flex-grow min-h-0">
          <!--suppress HtmlUnknownTarget -->
          <img :src="thumbnailUrl(post)" @load="formatText(id)">
        </div>
        <div v-else class="patch flex-grow min-h-0 bg-gray-800" />
        <div :ref="`feed-text-${id}`" class="excerpt min-h-0 overflow-hidden mt-2 mb-4 min-h-line">
          <div>{{post.excerpt}}</div>
        </div>
      </div>
    </div>
    <post-editor
      v-if="adminOrEditor && shouldOpenEditor"
      :open="shouldOpenEditor"
      :post-id="editorPostId"
      :type="editorPostType"
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

export default {
  name: 'Home',
  components: { Popper, PostEditorPalette, PostEditor },
  props: {},

  data: () => ({
    feed: {},
    unsubscribe: null,
    shouldOpenEditor: false,
    editorPostId: null,
    editorPostType: null
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
    closeEditor () {
      this.shouldOpenEditor = false
      this.editorPostId = null
      this.editorPostType = null
    },

    thumbnailUrl (post) {
      return post.cardSize
        ? post.thumbnail.full.url || post.thumbnail.preview.url
        : post.thumbnail.preview.url || post.thumbnail.full.url
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

    openEditor (postType, postId) {
      this.editorPostId = postId
      this.editorPostType = postType
      this.shouldOpenEditor = true
    },

    formatDate (timestamp) {
      return date.format(timestamp)
    },

    postType (string) {
      return string === 'post' ? 'blog' : string
    },

    setCellSize (id, size) {
      db.collection('feed').doc(id).update({
        cardSize: size
      })
    },

    getFeed () {
      this.unsubscribe = db.collection('feed')
        .where('status', '==', 'published').orderBy('date', 'desc')
        .onSnapshot(
          querySnapshot => {
            querySnapshot.forEach(async doc => {
              const feedItem = doc.data()
              this.$set(this.feed, doc.id, feedItem)
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
      grid-auto-rows: 300px;
      grid-gap: 24px;
      grid-auto-flow: dense;
      padding: 24px;

      .cell {
        position: relative;
        border-bottom: 2px solid transparentize($color-dimmed, 0.5);
        hyphens: auto;

        h1 {
          font-size: $h3;
        }

        .type-badge {
          text-transform: capitalize;
        }
        .badge {
          @apply flex items-center justify-center px-3 h-8 text-xs capitalize;
        }

        .edit-button:not(.active) {
          opacity: 0;
          transform: opacity $transition-time;
        }
        .edit-button.active {
          background: transparentize($color-dimmed, 0.8);
          border-radius: 50%;
          color: $color-aba-blue;
        }

        &:hover {
          .edit-button {
            opacity: 1;
          }
        }

        &.horizontal {
          @include wider-then(472px) {
            grid-column: auto / span 2;
            h1 {
              font-size: $h2;
            }
          }
        }

        &.vertical {
          grid-row: span 2;
        }

        &.big {
          grid-row: span 2;
          @include wider-then(472px) {
            grid-column: span 2;
            h1 {
              font-size: $h1;
            }
          }
        }

      }

      .thumbnail-box {
        /*margin: 5px -5px;*/
        /*width: 100%;*/
        /*height: 150px;*/

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: saturate(0);
        }
      }
    }
  }
</style>
