<template>
  <div class="residency">
    <h1>Residents:</h1>
    <div
      class="grid pt-lg"
      role="list"
      aria-label="List of residents">
      <profile-cell
        v-for="profile in orderedProfiles"
        :key="profile.id"
        :profile="profile"
        role="listitem"/>
    </div>
    <div
      v-if="loading"
      class="loading-state text-center p-lg"
      role="status"
      aria-live="polite">
      Loading residents...
    </div>
    <div
      v-if="!loading && !orderedProfiles.length"
      class="empty-state text-center p-lg"
      role="status">
      No residents found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineExpose } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { db } from '../../../lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import ProfileCell from '../ProfileCell.vue'

defineOptions({
  name: 'ResidencyPage'
})

interface Profile {
  id: string
  residencyStart?: string
  abaPosition: string
  [key: string]: any
}

// State
const profiles: Ref<Record<string, Profile>> = ref({})
const loading: Ref<boolean> = ref(true)
let unsubscribe: (() => void) | null = null

// Computed
const orderedProfiles: ComputedRef<Profile[]> = computed(() =>
  Object.values(profiles.value).sort((a: Profile, b: Profile) =>
    parseInt(b.residencyStart || '0') - parseInt(a.residencyStart || '0')
  )
)

// Method
const subscribeResidents = () => {
  const profilesRef = collection(db, 'profiles')
  const profilesQuery = query(profilesRef, where('abaPosition', '==', 'resident'))

  unsubscribe = onSnapshot(
    profilesQuery,
    (querySnapshot) => {
      querySnapshot.docChanges().forEach(docChange => {
        const doc = docChange.doc
        const profileData = { ...doc.data(), id: doc.id } as Profile

        switch (docChange.type) {
          case 'added':
          case 'modified':
            profiles.value[doc.id] = profileData
            break
          case 'removed':
            delete profiles.value[doc.id]
            break
        }
      })
      loading.value = false
    },
    (error: Error) => {
      console.error('Error fetching residents:', error)
      loading.value = false
    }
  )
}

// Lifecycle hooks
onMounted(() => {
  subscribeResidents()
})

onUnmounted(() => {
  if (typeof unsubscribe === 'function') unsubscribe()
})

// Expose reactive properties for template usage
defineExpose({
  loading,
  orderedProfiles
})
</script>

<style lang="scss" scoped>
.residency {
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-auto-rows: auto;
    grid-auto-flow: dense;
    gap: var(--spacing-lg, 2rem);
    max-width: 100%;
  }

  .loading-state,
  .empty-state {
    color: var(--text-color-light, #6b7280);
    font-size: 1.125rem;
  }
}
</style>
