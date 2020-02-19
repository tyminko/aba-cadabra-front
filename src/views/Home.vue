<template>
  <div class="home">
    <div class="feed-grid">
      <div v-for="post in feed"
           :key="post.id"
           :class="cellSize()"
           class="cell break-words flex flex-col">
        <header class="flex-grow-0">
          <div class="flex flex-align-center">
            <div class="badge mr-2 bg-gray-200">{{postType(post.postType)}}</div>
            <popper v-if="adminOrEditor"
                    placement="right"
                    arrow-size="18"
                    class="ml-auto">
              <template v-slot:reference="{show}">
                <span class="edit-button badge w-8 text-gray-600 hover:text-aba-blue" :class="{active:show}">
                  <i class="material-icons text-base cursor-pointer">edit</i>
                </span>
              </template>
              <post-editor-palete/>
            </popper>
          </div>
          <h1 class="mt-1">{{post.title}}</h1>
          <div class="mt-1">{{formatDate(post.date)}}</div>
        </header>
        <div v-if="post.thumbnail && post.thumbnail.mime.startsWith('image')"
             class="thumbnail-box flex-grow min-h-0">
          <img :src="post.thumbnail.preview.url || post.thumbnail.full.url">
        </div>
        <div v-else class="patch flex-grow min-h-0 bg-gray-800" />
        <div class="min-h-0 overflow-hidden">{{post.excerpt}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import { mapState } from 'vuex'
import Popper from './components/UI/Popper.js'
import PostEditorPalete from './admin/PostEditorPalette'

export default {
  name: 'Home',
  components: { Popper, PostEditorPalete },
  props: {},

  data: () => ({
    feed: {},
    unsubscribe: null
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  mounted () {
    this.getWorks()
  },

  methods: {
    cellSize () {
      const r = Math.random()
      if (r < 0.1) return 'vertical'
      if (r > 0.5 && r < 0.7) return 'horizontal'
      if (r > 0.9) return 'big'
      return false
    },

    formatDate (timestamp) {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric' })
    },

    postType (string) {
      return string === 'post' ? 'blog' : string
    },

    getWorks () {
      this.unsubscribe = db.collection('feed')
        .where('status', '==', 'published').orderBy('date', 'desc')
        .onSnapshot(
          querySnapshot => {
            querySnapshot.forEach(doc => {
              const salon = doc.data()
              // if (!work.posterImage && work.hasOwnProperty('attachments')) {
              //   work.posterImage = Object.values(work.attachments).sort((a, b) => a.order - b.order)[0]
              // }
              this.$set(this.feed, doc.id, salon)
            })
          },
          err => {
            // eslint-disable-next-line no-console
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
      --popper-border-width: 4px;

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
          color: $color-prime;
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
