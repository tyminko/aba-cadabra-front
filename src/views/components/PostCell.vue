<template>
  <div
    :class="cellSize"
    class="post-cell cell break-words flex flex-col">
    <header class="flex-grow-0">
      <div class="flex items-center">
        <div class="badge mr-2 bg-gray-200 whitespace-no-wrap truncate">{{typeLabel}}</div>
        <!--<span class="text-xs">{{post.id}}</span>-->
        <slot name="quick-edit-button" :cell-size="cellSize"/>
      </div>
    </header>
    <router-link
      :to="routerLink"
      class="block flex flex-col flex-grow min-h-0">
      <div>
        <h1 class="mt-1">{{title}}</h1>
        <h2 v-if="secondTittle" class="">{{secondTittle}}</h2>
        <div class="my-xs" :class="{'h2':post.type==='event'}">{{formattedDate}}</div>
      </div>
      <div
        v-if="thumbnailUrl"
        class="thumbnail-box flex-grow min-h-x2">
        <!--suppress HtmlUnknownTarget -->
        <img :src="thumbnailUrl" :key="thumbnailUrl">
      </div>
      <div v-else class="patch flex-grow min-h-0 bg-gray-800"/>
      <div
        v-if="post.excerpt"
        ref="excerpt"
        class="excerpt min-h-0 overflow-hidden mt-2 mb-4 min-h-line">
        <div>{{post.excerpt}}</div>
      </div>
    </router-link>
  </div>
</template>

<script>
import * as date from '../../lib/date'
import Ftellipsis from 'ftellipsis'

export default {
  name: 'PostCell',
  components: { },
  props: {
    post: { type: Object, required: true }
  },

  data: () => ({}),

  computed: {
    routerLink () {
      // return { name: this.$route.name, params: { postId: this.post.id } }
      if (this.post.type === 'post' && this.post.author) {
        return { name: 'author-blog', params: { authorId: this.post.author.uid, postId: this.post.id } }
      } else {
        return { name: 'event', params: { id: this.post.id } }
      }
    },
    typeLabel () {
      if (!this.post) return null
      if (this.post.partOfProgramme) {
        return this.post.partOfProgramme.title || this.post.partOfProgramme.singlePostLabel
      } else {
        switch (this.post.type) {
          case 'post': return `Blog ${this.post.author.displayName}`
          case 'event': return 'Event'
        }
      }
      return ''
    },
    title () {
      if (this.post.partOfProgramme && this.post.countNumber) {
        return `${this.post.partOfProgramme.singlePostLabel} # ${this.post.countNumber}`
      }
      return this.post.title
    },
    secondTittle () {
      if (this.post.partOfProgramme && this.post.countNumber) {
        return this.post.title
      }
      return ''
    },
    formattedDate () {
      return date.format(this.post.date, this.post.type === 'event' ? 'long' : '', 'de')
    },
    cellSize () {
      return (this.post || {}).cardSize || ''
    },
    thumbnailUrl () {
      const post = this.post
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
    }
  },

  watch: {
    // post () { this.formatText() }
  },

  methods: {
    async formatText () {
      await this.$nextTick()
      if (this.$refs.excerpt) {
        const el = this.$refs.excerpt
        const ellipsis = new Ftellipsis(el)
        ellipsis.calc()
        ellipsis.set()
        el.style.flexShrink = 0
      }
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  @import "../../styles/mixins";
  .post-cell {
    position: relative;
    border-bottom: 1px solid #000;
    hyphens: auto;

    h1, h2, .h2 {
      font-size: $h3;
      margin: 0;
      line-height: 1.1em;
    }

    a {
      @apply text-black;
      &:hover {
        @apply text-aba-blue no-underline;
      }
    }

    .type-badge {
      text-transform: capitalize;
    }
    .badge {
      @apply flex items-center justify-center px-sm h-1/2base text-xs capitalize;
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

    .excerpt {
      @include multi-line-truncate();
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
    position: relative;

    img {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      filter: saturate(0);
    }
  }
</style>
