<template>
  <div
    class="post-cell cell break-words flex flex-col"
    :class="[cellSize, post.status, post.type, (allowReservation ? 'upcoming' : '')]">
    <header class="flex-grow-0 relative">
      <div class="flex items-center relative">
        <div class="badge">
          <router-link v-if="routerTypeLink" :to="routerTypeLink">{{typeLabel}}</router-link>
          <span v-else>{{typeLabel}}</span>
          <div v-if="post.status !== 'public'" class="status">
            {{post.status}}
          </div>
        </div>
        <div v-if="upcoming" class="upcoming-label">{{upcomingLabel}}</div>
        <slot name="quick-edit-button" :cell-size="cellSize"/>
      </div>
    </header>
    <router-link
      :to="routerLink"
      class="block flex flex-col flex-grow min-h-0">
      <div>
        <h1 class="mt-1">{{title}}</h1>
        <h2 v-if="secondTittle" class="">{{secondTittle}}</h2>
        <div class="my-xs" :class="{'h2':post.type==='event', 'text-aba-blue':upcoming }">{{formattedDate}}</div>
      </div>
      <div
        v-if="thumbnailUrl"
        class="thumbnail-box flex-grow">
        <!--suppress HtmlUnknownTarget -->
        <img v-lazy="thumbnailUrl" :key="thumbnailUrl">
      </div>
      <div v-else class="patch flex-grow min-h-0 bg-gray-800"/>
      <div
        v-if="post.excerpt"
        ref="excerpt"
        class="excerpt min-h-0 overflow-hidden mt-2 mb-4 min-h-line"
        :class="{short: post.type==='event'}">
        <div v-if="post.type==='post'">{{post.excerpt}}</div>
        <template v-else>
          <credits-string v-if="hosts.length" no-link prefix="Hosted by" :persons="hosts" class="inline" />
          <br v-if="hosts.length && participants.length">
          <credits-string v-if="participants.length" no-link prefix="With" :persons="participants" class="inline" />
        </template>
      </div>
    </router-link>
    <button
      v-if="allowReservation"
      class="h-auto px-base py-sm text-aba-blue border-2 border-aba-blue self-end"
      @click="openReservation=!openReservation">
      Make Reservation
    </button>
    <reservation-form-popover
      v-if="allowReservation"
      :open="openReservation"
      :event-data="eventData"
      @close="openReservation=false"/>
    <reservation-confirm
      v-if="shouldConfirmReservation"
      :event-id="eventId"
      :data="{title,formattedDate,location}"
      :confirmed="closeReservationConfirmedMessage"
      @close="()=>{}"/>
  </div>
</template>

<script>
import * as date from '../../lib/date'
import Ftellipsis from 'ftellipsis'
import ReservationMixin from '../../mixins/reservation'
import CreditsString from './CreditsString'
import ReservationFormPopover from './forms/ReservationFormPopover'
import ReservationConfirm from './forms/ReservationConfirm'

export default {
  name: 'PostCell',
  mixins: [ReservationMixin],
  components: { ReservationConfirm, ReservationFormPopover, CreditsString },
  props: {
    post: { type: Object, required: true }
  },

  data: () => ({
    openReservation: false
  }),

  computed: {
    routerLink () {
      // return { name: this.$route.name, params: { postId: this.post.id } }
      if (this.post.type === 'post' && this.post.author) {
        return { name: 'author-blog', params: { authorId: this.post.author.uid, postId: this.post.id } }
      } else {
        return { name: 'event', params: { id: this.post.id } }
      }
    },
    routerTypeLink () {
      if (!this.post) return null
      if (this.post.partOfProgramme) {
        return { name: 'programme', params: { id: this.post.partOfProgramme.programmeId } }
      }
      return null
    },

    typeLabel () {
      if (!this.post) return null
      if (this.post.partOfProgramme) {
        return this.post.partOfProgramme.title || this.post.partOfProgramme.singlePostLabel
      } else {
        switch (this.post.type) {
          case 'post': return `Blog ${this.post.author.displayName}`
          case 'event': return 'Event'
          default: return this.post.type
        }
      }
    },
    title () {
      if (this.post.partOfProgramme && this.post.countNumber) {
        return `${this.post.partOfProgramme.singlePostLabel} #${this.post.countNumber}`
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
      return date.format(
        this.post.date,
        this.post.type === 'event' && this.upcoming ? 'datetime' : '', 'de'
      )
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
    },
    hosts () {
      if (!this.post || !this.post.participants) return []
      return Object.values(this.post.participants || []).filter(p => p.star)
    },

    participants () {
      if (!this.post || !this.post.participants) return []
      return Object.values(this.post.participants || []).filter(p => !p.star)
    },

    eventData () {
      return {
        eventId: this.post.id,
        eventUrl: window.location.origin + this.$router.resolve(this.routerLink).href,
        eventInfo: {
          title: this.title,
          secondTittle: this.secondTittle,
          dateString: this.formattedDate,
          locationString: (this.post.location || {}).address
        }
      }
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
    /*border-bottom: 1px solid #000;*/
    hyphens: auto;

    &:after {
      content: "";
      position: absolute;
      height: 0;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      border-bottom: 1px solid $color-aba-blue;
      width: calc(100% + #{$base-size} / 2);
    }

    &.upcoming {
      border-bottom: none;
      & > * {
        color: $color-aba-blue
      }
      &:after {
        content: none;
      }
      .excerpt {
        margin-bottom: $small-padding !important;
      }
    }

    &.internal {
      // border-bottom: 1px solid $color-aba-blue;
    }
    &.draft {
      &:after {
        border-style: dashed;
        border-color: $color-aba-red;
      }
      & img {opacity: 0.5;}
      & * {
        font-style: italic !important;
      }

      a {
        @apply text-gray-500;
        &:hover {
          @apply text-aba-red no-underline;
        }
      }
      .status {
        background: $color-aba-red;
      }
    }

    h1, h2, .h2 {
      font-size: $h3;
      margin: 0;
      line-height: 1.05em;
    }
    h2 {
      font-size: $h4;
      font-weight: 300;
      opacity: 0.5;
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
      @apply px-sm py-sm text-xs capitalize truncate;
      position: relative;
      min-width: 0;
      margin-left: -0.5rem;
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(closest-side, #c6c6c6, transparent);
        z-index: -1;
      }
      &:has(a):hover::after {
        background: radial-gradient(closest-side, rgb(167, 167, 255), transparent);
      }
    }

    .upcoming-label {
      position: relative;
      z-index: 10;
      padding: 0.1rem 0.4rem;
      background: $color-aba-blue;
      color: #fff;
      font-size: 75%;
      text-transform: uppercase;
      left: -6px;
      top: -4px;
      transform: rotate(3deg);
    }

    .status {
      @apply text-xs;
      position: absolute;
      white-space: nowrap;
      text-transform: capitalize;
      padding: 0.18rem 0.45rem;
      bottom: calc(100% - 7px);
      left: -5px;
      font-size: 87%;
      background: $color-aba-blue;
      color: white;
      font-weight: lighter;
      border-radius: 1rem;
      z-index: 100;
      transform: rotate(-1.5deg);
    }

    .edit-button:not(.active) {
      opacity: 0;
      transition: opacity $transition-time;
    }
    .edit-button.active {
      background: transparentize($color-dimmed, 0.8);
      border-radius: 50%;
      color: $color-aba-blue;
    }

    .excerpt {
      @include multi-line-truncate();
      &.short {
        @include multi-line-truncate(2);
      }
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

      opacity: 0;
      transition: opacity 0.5s;
      &[lazy=loaded] {
        opacity: 1;
      }
    }
  }
</style>
