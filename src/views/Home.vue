<template>
  <div class="home">
    <div class="grid">
      <div v-for="post in feed"
           :key="post.id"
           :class="cellSize()"
           class="cell break-words flex flex-col">
        <h1 class="flex-grow-0">{{post.title}}</h1>
        <div v-if="post.thumbnail && post.thumbnail.mime.startsWith('image')"
             class="thumbnail-box flex-grow min-h-0">
          <img :src="post.thumbnail.preview.url||post.thumbnail.full.url">
        </div>
        <div class="min-h-0 overflow-hidden">{{post.excerpt}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../lib/firebase'

export default {
  name: 'Home',
  props: {},

  data: () => ({
    feed: {},
    unsubscribe: null
  }),

  computed: {},

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
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-auto-rows: 250px;
      grid-gap: 24px;
      grid-auto-flow: dense;
      padding: 24px;

      .cell {
        h1: {}
        border-bottom: 1px solid $color-dimmed;

        &.horizontal {
          @include wider-then(472px) {
            grid-column: auto / span 2;
          }
        }

        &.vertical {
          grid-row: span 2;
        }

        &.big {
          grid-row: span 2;
          @include wider-then(472px) {
            grid-column: span 2;
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
