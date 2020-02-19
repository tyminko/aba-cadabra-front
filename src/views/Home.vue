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
                <span class="edit-button badge w-8 text-gray-600 hover:text-aba-blue" :class="{active:show}">
                  <i class="material-icons text-base cursor-pointer">edit</i>
                </span>
              </template>
              <post-editor-palette :current="cellSize(id)" @set-size="setCellSize(id, $event)"/>
            </popper>
          </div>
          <h1 class="mt-1">{{post.title}}</h1>
          <div class="mt-1">{{formatDate(post.date)}}</div>
        </header>
        <div v-if="post.thumbnail && post.thumbnail.mime.startsWith('image')"
             class="thumbnail-box flex-grow min-h-0">
          <img :src="post.thumbnail.preview.url || post.thumbnail.full.url" @load="formatText(id)">
        </div>
        <div v-else class="patch flex-grow min-h-0 bg-gray-800" />
        <div :ref="`feed-text-${id}`" class="excerpt min-h-0 overflow-hidden mt-2 mb-4 min-h-line">
          <div>{{post.excerpt}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../lib/firebase'
import { mapState } from 'vuex'
import Ftellipsis from 'ftellipsis'
import Popper from './components/UI/Popper.js'
import PostEditorPalette from './admin/PostEditorPalette'

export default {
  name: 'Home',
  components: { Popper, PostEditorPalette },
  props: {},

  data: () => ({
    feed: {},
    unsubscribe: null,
    sizes: {}
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  watch: {
    // feed: {
    //   async handler (val) {
    //     // setTimeout(() => {
    //     //   // !!! DEBUG !!!
    //     //   console.log(`%c handler() %c val: `, 'background:#ffcc00;color:#000', 'color:#00aaff', val)
    //     //   if (this.$refs['feed-items']) {
    //     //     this.$refs['feed-items'].forEach(el => {
    //     //       // !!! DEBUG !!!
    //     //       console.log(`%c SET ELL %c el: `, 'background:#ffcc00;color:#000', 'color:#00aaff', el)
    //     //       const excerptEl = el.querySelector('.excerpt')
    //     //       console.log(`%c () %c excerptEl: `, 'background:#ffbb00;color:#000', 'color:#00aaff', excerptEl)
    //     //       const ellipsis = new Ftellipsis(excerptEl)
    //     //       // !!! DEBUG !!!
    //     //       console.log(`%c () %c ellipsis: `, 'background:#ffcc00;color:#000', 'color:#00aaff', ellipsis)
    //     //       ellipsis.calc()
    //     //       ellipsis.set()
    //     //     })
    //     //   }
    //     // }, 200)
    //   },
    //   deep: true
    // }
  },

  mounted () {
    this.getFeed()
  },

  methods: {
    async formatText (id) {
      if (this.$refs[`feed-text-${id}`]) {
        await this.$nextTick()
        const el = this.$refs[`feed-text-${id}`][0]
        const ellipsis = new Ftellipsis(el)
        // !!! DEBUG !!!
        console.log(`%c formatText() %c ellipsis: `, 'background:#ffbb00;color:#000', 'color:#00aaff', ellipsis)
        ellipsis.calc()
        ellipsis.set()
        el.style.flexShrink = 0
      }
    },

    cellSize (id) {
      if (this.feed[id] && this.feed[id].cardSize) return this.feed[id].cardSize
      return ''
      // const r = Math.random()
      // let s = ''
      // if (r < 0.1) s = 'vertical'
      // if (r > 0.5 && r < 0.7) s = 'horizontal'
      // if (r > 0.9) s = 'big'
      // this.sizes[id] = s
      // return s
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
