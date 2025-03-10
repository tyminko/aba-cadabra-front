<template>
  <form-popover
    v-if="showConfirmation"
    :open="showConfirmation"
    :buttons="{}"
    :processing="processing"
    :processing-message="processingMessage"
    :aria-labelledby="titleId"
    :aria-describedby="descriptionId"
    @close="emit('close')">
    <smooth-reflow class="flex items-center justify-center">
      <div v-if="reservation" class="confirmation-content" role="status" aria-live="polite">
        <h1 :id="titleId" class="text-aba-blue">Thank you for your reservation!</h1>
        <h2 :id="eventTitleId" class='title mt-base'>{{data.title}}</h2>
        <div :id="dateId" class='date mt-sm' aria-label="Event date">{{data.formattedDate}}</div>
        <div :id="locationId" class='date' aria-label="Event location">{{data.location}}</div>
        <p :id="descriptionId" class="mt-base text-aba-blue">See you there!</p>
      </div>
      <div
        v-else-if ="error"
        class="error-content"
        role="alert"
        :aria-labelledby="errorTitleId">
        <h1 :id="errorTitleId" class="text-red-500">Unable to confirm reservation</h1>
        <p class="mt-base">{{error}}</p>
      </div>
    </smooth-reflow>
  </form-popover>
</template>

<script setup>
import { ref, computed, onCreated } from 'vue'
import { useRoute } from 'vue-router'
import { functions } from '../../../lib/firebase'
import { useId } from '../../../composables/useId'
import FormPopover from './FormPopover'
import SmoothReflow from '../UI/SmoothReflow'

// Prop
const props = defineProp({
  eventId: { type: String, required: true },
  data: { type: Object, required: true }
})

// Emit
const emit = defineEmit(['close'])

// Router
const route = useRoute ()

// State
const reservation = ref(null)
const processing = ref(false)
const error = ref(null)
const processingMessage = ref('Confirming reservation...')

// Generate unique ID
const baseId = useId('reservation-confirm')
const titleId = useId({ prefix: 'title', namespace: baseId })
const eventTitleId = useId({ prefix: 'event-title', namespace: baseId })
const dateId = useId({ prefix: 'date', namespace: baseId })
const locationId = useId({ prefix: 'location', namespace: baseId })
const descriptionId = useId({ prefix: 'description', namespace: baseId })
const errorTitleId = useId({ prefix: 'error-title', namespace: baseId })

// Computed
const showConfirmation = computed(() => !!route.params.token)

// Method
const confirmReservation = async () => {
  if (!route.params.token) return

  processing.value = true
  error.value = null

  try {
    const confirmReservation = functions.httpsCallable('reservation-confirm')
    const result = await confirmReservation({
      eventId: props.eventId,
      token: route.params.token
    })
    reservation.value = result
  } catch (err) {
    error.value = err.message || 'An error occurred while confirming your reservation'
  } finally {
    processing.value = false
  }
}

// Lifecycle
onCreated(() => {
  if (route.params.token) {
    confirmReservation ()
  }
})
</script>

<style lang="scss">
.confirmation-content {
  text-align: center;

  .title {
    @apply font-semibold text-lg;
  }

  .date {
    @apply text-gray-600;
  }
}

.error-content {
  text-align: center;
  padding: 1rem;

  p {
    @apply text-gray-600;
  }
}
</style>
