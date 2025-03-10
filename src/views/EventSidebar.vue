<template>
  <div class="event-sidebar">
    <section v-if="showMap">
      <AbaMap
        v-if="latLng"
        ref="mapRef"
        :markers="mapMarkers"
        :options="mapOptions"
        class="mb-base"/>
    </section>
    <section v-if="profiles.length" class="space-y-base">
      <ProfileCell
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"/>
    </section>
    <section v-if="authorEvents.length" class="space-y-base">
      <PostCell
        v-for="event in authorEvents"
        :key="event.id"
        :post="event" />
    </section>
    <SmoothReflow>
      <section v-if="tags.length" class="space-y-base">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in tags"
            :key="tag.id"
            class="bg-aba-blue text-white px-3 py-1 rounded-full text-sm">
            {{ tag.title }}
          </div>
        </div>
        <PostCell
          v-for="tagPost in tagPosts"
          :key="tagPost.id"
          :post="tagPost" />
      </section>
    </SmoothReflow>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { db, FieldPath } from '../lib/firebase'
import PostCell from './components/PostCell.vue'
import SmoothReflow from './components/UI/SmoothReflow.vue'
import ProfileCell from './components/ProfileCell.vue'
import { abaMapStyle } from '../lib/map'
import AbaMap from './components/UI/AbaMap.vue'

// Props
const props = defineProps({
  post: {
    type: Object,
    default: () => ({})
  },
  showMap: {
    type: Boolean,
    default: false
  }
})

// Refs
const mapRef = ref(null)
const profiles = ref([])
const authorEvents = ref([])
const tagPosts = ref([])
const profileUnsubscribe = null

// Constants
const mapOptions = {
  disableDefaultUI: true,
  backgroundColor: '#fff',
  styles: [...abaMapStyle.basic]
}

// Computed
const tags = computed(() => props.post?.tags || [])

const participantsIds = computed(() =>
  (props.post?.participants || []).map(p => p.id)
)

const latLng = computed(() => {
  if (!props.post?.location) return null
  const { lat, lng } = props.post.location
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  }
})

const mapMarkers = computed(() =>
  latLng.value
    ? [{
        ...latLng.value,
        label: `#${props.post.countNumber}`,
        url: props.post.url
      }]
    : []
)

// Methods
const subscribeParticipantsProfiles = async () => {
  profiles.value = []
  if (!participantsIds.value.length) return

  try {
    const snapshot = await db.collection('profiles')
      .where(FieldPath.documentId(), 'in', participantsIds.value)
      .get()

    profiles.value = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }))
  } catch (error) {
    console.error('Error fetching participant profiles:', error)
  }
}

const getTagPosts = async () => {
  const tagIds = props.post?.tagIds || []
  if (!tagIds.length) {
    tagPosts.value = []
    return
  }

  try {
    const snapshot = await db.collection('posts')
      .where('status', '==', 'public')
      .where('tagIds', 'array-contains-any', tagIds)
      .get()

    const posts = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }))

    tagPosts.value = posts.filter(post =>
      post.type === 'event' ||
      post.author.uid !== (props.post?.author?.uid || props.author?.uid)
    )
  } catch (error) {
    console.error('Error fetching tag posts:', error)
    tagPosts.value = []
  }
}

// Watchers
watch(() => props.post, () => {
  subscribeParticipantsProfiles()
  getTagPosts()
}, { deep: true })

// Lifecycle
onMounted(() => {
  subscribeParticipantsProfiles()
  getTagPosts()
})

onBeforeUnmount(() => {
  if (typeof profileUnsubscribe === 'function') {
    profileUnsubscribe()
  }
})
</script>

<style lang="scss" scoped>
@import "../styles/mixins";

.event-sidebar {
  .excerpt {
    @include multi-line-truncate(3);
  }
}
</style>
