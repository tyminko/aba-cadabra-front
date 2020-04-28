<template>
  <content-with-sidebar class="event">
    <template v-slot:main>
      <div class="text-block relative">
        <button
          v-if="allowEdit"
          class="compact absolute right-0"
          @click="openEditor">
          <i class="material-icons text-base">edit</i>
        </button>
        <h1 class="text-5xl mt-sm">{{title}}</h1>
        <h2 class="mt-sm">{{secondTittle}}</h2>
        <div class="flex mt-base">
          <h1 class="font-light">{{formattedDate}}</h1>
        </div>
        <div v-if="location" class="location mt-sm">
          {{location}}
        </div>
        <div class="participants my-base">
          <credits-string v-if="hosts.length" prefix="Hosted by" :persons="hosts" />
          <credits-string v-if="participants.length" prefix="With" :persons="participants" />
        </div>
        <button
          class="h-auto px-base py-sm text-aba-blue border-2 border-aba-blue"
          @click="openReservation=!openReservation">
          Make Reservation
        </button>
      </div>
      <div v-for="item in attachments" :key="item.id" class="attachment mt-base mb-sm">
        <div class="attachment-box relative">
          <img
            :src="item.url"
            :alt="item.caption"
            :width="(item.dimensions || {}).w"
            :height="(item.dimensions || {}).h"
            class="bg-gray-400"/>
          <div v-if="item.caption" class="text-block text-sm">
            {{item.caption}}
          </div>
        </div>
      </div>
      <div class="text-block mt-base" v-html="content" />
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
    </template>
    <template v-slot:sidebar>
      <event-sidebar :post="post" :show-map="true"/>
    </template>
  </content-with-sidebar>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { db } from '../lib/firebase'
import * as date from '../lib/date'
import DOMPurify from 'dompurify'
import ContentWithSidebar from './components/UI/layouts/ContentWithSidebar'
import CreditsString from './components/CreditsString'
import EventSidebar from './EventSidebar'
import ReservationFormPopover from './components/forms/ReservationFormPopover'
import ReservationConfirm from './components/forms/ReservationConfirm'

export default {
  name: 'EventView',
  components: { ReservationConfirm, ReservationFormPopover, EventSidebar, CreditsString, ContentWithSidebar },
  props: {},

  data: () => ({
    unsubscribe: null,
    post: null,
    openReservation: false,
    reservation: null,
    closeReservationConfirmedMessage: false
  }),

  computed: {
    ...mapState(['user']),
    allowEdit () { return this.user && (this.user.role === 'admin' || this.user.role === 'editor') },

    eventData () {
      return {
        eventId: this.eventId,
        eventUrl: window.location.href,
        eventInfo: {
          title: this.title,
          secondTittle: this.secondTittle,
          dateString: this.formattedDate,
          locationString: this.location
        }
      }
    },

    eventId () {
      return this.$route.params.id
    },

    title () {
      if (!this.post) return ''
      if (this.post.partOfProgramme && this.post.countNumber) {
        return `${this.post.partOfProgramme.singlePostLabel} #${this.post.countNumber}`
      }
      return this.post.title
    },

    secondTittle () {
      if (!this.post) return ''
      if (this.post.partOfProgramme && this.post.countNumber) {
        return this.post.title
      }
      return ''
    },

    formattedEndDate () {
      if (!this.post) return ''
      return date.format(this.post.date, 'long', 'de')
    },

    formattedDate () {
      if (!this.post) return ''
      return date.format(this.post.date, 'full', 'de')
    },

    location () {
      return ((this.post || {}).location || {}).address || ''
    },

    attachments () {
      const count = Object.keys((this.post || {}).attachments || {}).length
      if (!count) return []
      return Object.entries(this.post.attachments).reduce((res, [id, item]) => {
        const { preview, full, original } = item.srcSet
        const src = full || (preview || {}).size > original.size ? preview : original
        res.push({ id, type: item.type, url: src.url, dimensions: src.dimensions, caption: item.caption })
        return res
      }, [])
    },

    hosts () {
      if (!this.post || !this.post.participants) return []
      return Object.values(this.post.participants || []).filter(p => p.star)
    },

    participants () {
      if (!this.post || !this.post.participants) return []
      return Object.values(this.post.participants || []).filter(p => !p.star)
    },

    content () {
      if ((this.post || {}).content) {
        return DOMPurify.sanitize(this.post.content)
      }
      return ''
    },

    allowReservation () {
      return !this.$route.params.token // ...
    },

    shouldConfirmReservation () {
      const token = this.$route.params.token
      return !!token && ((this.post || {}).reservationsPending || []).includes(token)
    },
    showReservationConfirmedMessage () {
      const token = this.$route.params.token
      return !!token &&
        !this.closeReservationConfirmedMessage &&
        ((this.post || {}).reservationsConfirmed || []).includes(token)
    }
  },

  created () {
    this.subscribeEvent()
  },

  watch: {
    $route () {
      this.unsubscribeEvent()
      this.subscribeEvent()
    }
  },

  beforeDestroy () {
    this.unsubscribeEvent()
  },

  methods: {
    ...mapActions(['showEditor']),
    openEditor () {
      if (this.post) this.showEditor({ value: this.post })
    },
    subscribeEvent () {
      if (!this.eventId) return this.unsubscribeEvent()
      this.unsubscribe = db.collection('posts')
        .doc(this.eventId)
        .onSnapshot(doc => {
          this.post = { ...doc.data(), id: doc.id }
        }, err => {
          console.error('Event subscribeEvent:', err)
        })
    },

    async closeConfirmation () {
    },

    unsubscribeEvent () {
      if (typeof this.unsubscribe === 'function') this.unsubscribe()
      this.post = null
    }
  }
}
</script>

<style lang="scss">
  .event {
    .list-string {
      & >*:not(:last-child) {
        &:after {
          content: ", ";
        }
      }
    }
  }
</style>
