<template>
  <ContentWithSidebar class="event">
    <template #main>
      <div class="text-block relative">
        <button
          v-if="allowEdit"
          class="compact absolute right-0 hover:text-aba-blue transition-colors"
          @click="openEditor">
          <i class="material-icons text-base">edit</i>
        </button>
        <h1 class="text-5xl mt-sm">{{ title }}</h1>
        <h2 v-if="secondTitle" class="mt-sm">{{ secondTitle }}</h2>
        <div class="flex mt-base">
          <h1 class="font-light">{{ formattedDate }}</h1>
        </div>
        <div v-if="location" class="location mt-sm">
          {{ location }}
        </div>
        <div class="participants my-base">
          <CreditsString v-if="hosts.length" prefix="Hosted by" :persons="hosts" />
          <CreditsString v-if="participants.length" prefix="With" :persons="participants" />
        </div>
        <div v-if="partners.length" class="partners my-base">
          <CreditsString prefix="Supported by" :persons="partners" :no-link="true"/>
        </div>
        <button
          v-if="allowReservation"
          class="h-auto px-base py-sm text-aba-blue border-2 border-aba-blue hover:bg-aba-blue hover:text-white transition-colors"
          @click="toggleReservation">
          Make Reservation
        </button>
      </div>
      <AttachmentsView :attachments="attachments"/>
      <div class="text-block mt-base" v-html="sanitizedContent" />
      <ReservationFormPopover
        v-if="allowReservation"
        :open="openReservation"
        :event-data="eventData"
        @close="closeReservation"/>
      <ReservationConfirm
        v-if="shouldConfirmReservation"
        :event-id="eventId"
        :data="confirmationData"
        :confirmed="closeReservationConfirmedMessage"
        @close="closeConfirmation"/>
    </template>
    <template #sidebar>
      <EventSidebar :post="post" :show-map="true"/>
    </template>
  </ContentWithSidebar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { db } from '../lib/firebase'
import * as date from '../lib/date'
import { useReservation } from '../composables/useReservation'
import DOMPurify from 'dompurify'
import ContentWithSidebar from './components/UI/layouts/ContentWithSidebar.vue'
import CreditsString from './components/CreditsString.vue'
import EventSidebar from './EventSidebar.vue'
import ReservationFormPopover from './components/forms/ReservationFormPopover.vue'
import ReservationConfirm from './components/forms/ReservationConfirm.vue'
import AttachmentsView from './components/AttachmentsView.vue'

// Props
const props = defineProps({
  value: {
    type: Object,
    default: null
  }
})

// Store & Router
const store = useStore()
const route = useRoute()

// Composables
const { allowReservation, shouldConfirmReservation } = useReservation()

// State
const post = ref(null)
const openReservation = ref(false)
const closeReservationConfirmedMessage = ref(false)
let unsubscribe = null

// Computed
const user = computed(() => store.state.user)
const allowEdit = computed(() =>
  user.value && (user.value.role === 'admin' || user.value.role === 'editor')
)

const eventId = computed(() => route.params.id)

const eventData = computed(() => ({
  eventId: eventId.value,
  eventUrl: window.location.href,
  eventInfo: {
    title: title.value,
    secondTitle: secondTitle.value,
    dateString: formattedDate.value,
    locationString: location.value
  }
}))

const title = computed(() => {
  if (!post.value) return ''
  if (post.value.partOfProgramme && post.value.countNumber) {
    return `${post.value.partOfProgramme.singlePostLabel} #${post.value.countNumber}`
  }
  return post.value.title
})

const secondTitle = computed(() => {
  if (!post.value) return ''
  if (post.value.partOfProgramme && post.value.countNumber) {
    return post.value.title
  }
  return ''
})

const formattedDate = computed(() => {
  if (!post.value) return ''
  return date.format(post.value.date, 'full', 'de')
})

const location = computed(() =>
  ((post.value || {}).location || {}).address || ''
)

const partners = computed(() =>
  [...(post.value || {}).supportedBy || []].map(p => ({
    id: p.id,
    displayName: p.title || p.name
  }))
)

const attachments = computed(() => {
  const postAttachments = (post.value || {}).attachments || {}
  const count = Object.keys(postAttachments).length
  if (!count) return []

  return Object.entries(postAttachments)
    .sort((a, b) => a.order - b.order)
    .reduce((res, [id, item]) => {
      const { preview, full, original } = item.srcSet
      let src
      if (item.type === 'embed/vimeo') {
        src = full
        res.push({ id, type: item.type, vimeoId: item.name, url: src.url, dimensions: src.dimensions, caption: item.caption })
      } else if (item.type === 'embed/mixcloud') {
        src = full
        res.push({ id, type: item.type, html: item.html, url: src.url, dimensions: src.dimensions, caption: item.caption })
      } else {
        src = full || (preview || {}).size > original.size ? preview : original
        res.push({ id, type: item.type, url: src.url, dimensions: src.dimensions, caption: item.caption })
      }
      return res
    }, [])
})

const hosts = computed(() => {
  if (!post.value?.participants) return []
  return Object.values(post.value.participants).filter(p => p.star)
})

const participants = computed(() => {
  if (!post.value?.participants) return []
  return Object.values(post.value.participants).filter(p => !p.star)
})

const sanitizedContent = computed(() => {
  if (post.value?.content) {
    return DOMPurify.sanitize(post.value.content)
  }
  return ''
})

const confirmationData = computed(() => ({
  title: title.value,
  formattedDate: formattedDate.value,
  location: location.value
}))

// Methods
const openEditor = () => {
  if (post.value) {
    store.dispatch('showEditor', { value: post.value })
  }
}

const toggleReservation = () => {
  openReservation.value = !openReservation.value
}

const closeReservation = () => {
  openReservation.value = false
}

const closeConfirmation = () => {
  closeReservationConfirmedMessage.value = true
}

const subscribeEvent = () => {
  if (props.value) {
    post.value = props.value
    return
  }

  if (!eventId.value) {
    unsubscribeEvent()
    return
  }

  unsubscribe = db.collection('posts')
    .doc(eventId.value)
    .onSnapshot(
      doc => {
        post.value = { ...doc.data(), id: doc.id }
      },
      error => {
        console.error('Event subscription error:', error)
        post.value = null
      }
    )
}

const unsubscribeEvent = () => {
  if (typeof unsubscribe === 'function') {
    unsubscribe()
  }
  post.value = null
}

// Lifecycle
onMounted(() => {
  subscribeEvent()
})

onBeforeUnmount(() => {
  unsubscribeEvent()
})

// Route watcher
watch(() => route.path, () => {
  unsubscribeEvent()
  subscribeEvent()
})
</script>

<style lang="scss" scoped>
.event {
  .list-string {
    & > *:not(:last-child) {
      &:after {
        content: ", ";
      }
    }
  }
}
</style>
