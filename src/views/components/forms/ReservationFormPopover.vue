<template>
  <FormPopover
    :open="open"
    :processing="processing"
    :buttons="buttons"
    :valid="isValid"
    :processing-message="processingMessage"
    :error="error"
    :title="title"
    class="reservation-form-popover"
    :aria-labelledby="titleId"
    :aria-describedby="descriptionId"
    role="dialog"
    aria-modal="true"
    @close="handleClose"
    @esc="handleClose"
    @submit="handleSubmit">
    <template #header>
      <div
        :id="descriptionId"
        class="text-sm text-gray-600 mb-4"
        v-if="eventData.eventInfo">
        <h2 :id="titleId" class="font-medium">{{ eventData.eventInfo.title }}</h2>
        <div v-if="eventData.eventInfo.secondTittle" class="subtitle">
          {{ eventData.eventInfo.secondTittle }}
        </div>
        <div class="mt-1 event-details">
          <span class="event-date" aria-label="Event date">
            {{ eventData.eventInfo.dateString }}
          </span>
          <span
            v-if="eventData.eventInfo.locationString"
            class="ml-2 event-location"
            aria-label="Event location">
            <i class="material-icons text-base align-text-bottom" aria-hidden="true">location_on</i>
            {{ eventData.eventInfo.locationString }}
          </span>
        </div>
      </div>
    </template>

    <ReservationForm
      ref="reservationRef"
      :event-data="eventData"
      :disabled="processing"
      :aria-labelledby="formTitleId"
      @processing="updateProcessing"
      @update-processing-message="updateProcessingMessage"
      @update-buttons="updateButtons"
      @valid="updateValid"
      @error="handleError"/>

    <template #footer>
      <div
        v-if="error"
        :id="errorId"
        role="alert"
        aria-live="assertive"
        class="text-sm text-red-600 mt-2">
        {{ error }}
      </div>
      <div
        v-if="processing"
        :id="statusId"
        role="status"
        aria-live="polite"
        class="text-sm text-gray-600 mt-2">
        {{ processingMessage }}
      </div>
    </template>
  </FormPopover>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useId } from '../../../composables/useId'
import FormPopover from './FormPopover.vue'
import ReservationForm from './ReservationForm.vue'

// Prop
const props = defineProp({
  open: {
    type: Boolean,
    default: false
  },
  eventData: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value &&
        typeof value === 'object' &&
        'eventId' in value &&
        'eventUrl' in value &&
        'eventInfo' in value &&
        typeof value.eventInfo === 'object' &&
        'title' in value.eventInfo
      )
    }
  }
})

// Emit
const emit = defineEmit({
  close: null,
  'submit-success': (payload) => {
    return payload && typeof payload === 'object' && 'reservationId' in payload
  },
  'submit-error': (error) => error instanceof Error,
  'processing-state': (state) => typeof state === 'boolean'
})

// Ref
const reservationRef = ref(null)

// State
const isValid = ref(false)
const processing = ref(false)
const processingMessage = ref('')
const error = ref('')
const buttons = ref({
  close: 'Cancel',
  submit: 'Submit Reservation'
})

// Generate unique ID
const baseId = useId('reservation-form')
const titleId = useId({ prefix: 'title', namespace: baseId })
const formTitleId = useId({ prefix: 'form-title', namespace: baseId })
const descriptionId = useId({ prefix: 'description', namespace: baseId })
const errorId = useId({ prefix: 'error', namespace: baseId })
const statusId = useId({ prefix: 'status', namespace: baseId })

// Computed
const title = computed(() => 'Make a Reservation')

// Method
const updateProcessing = (value) => {
  processing.value = value
  emit('processing-state', value)

  if (value) {
    error.value = '' // Clear error when processing start
  }
}

const updateProcessingMessage = (message) => {
  processingMessage.value = message
}

const updateButtons = (newButtons) => {
  if (typeof newButtons === 'object') {
    buttons.value = { ...buttons.value, ...newButtons }
  }
}

const updateValid = (value) => {
  isValid.value = Boolean(value)
}

const handleError = (errorMessage) => {
  error.value = errorMessage
  processing.value = false
}

const handleClose = () => {
  if (processing.value) return // Prevent closing while processing

  // Reset form state
  error.value = ''
  processingMessage.value = ''
  isValid.value = false

  emit('close')
}

const handleSubmit = async () => {
  if (!reservationRef.value || processing.value) return

  error.value = '' // Clear previous error

  try {
    processing.value = true
    const result = await reservationRef.value.submit ()

    if (!result || !result.reservationId) {
      throw new Error('Invalid reservation response')
    }

    emit('submit-success', result)
    handleClose ()
    return result
  } catch (err) {
    console.error('Reservation submission failed:', err)
    error.value = err.message || 'Failed to submit reservation. Please try again.'
    emit('submit-error', err)
  } finally {
    processing.value = false
  }
}

// Watcher
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    // Reset form state when closing
    error.value = ''
    processingMessage.value = ''
    isValid.value = false
  }
})
</script>

<style lang="scss" scoped>
.reservation-form-popover {
  :deep(.form-popover-content) {
    min-width: min(90vw, 500px);
  }

  .event-details {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;

    .event-date,
    .event-location {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .material-icons {
    font-size: 1.1em;
    vertical-align: middle;
    margin-top: -2px;
  }

  .subtitle {
    color: var(--gray-700);
    margin-top: 0.25rem;
  }
}
</style>
