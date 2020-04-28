<template>
  <form-popover
    v-if="showConfirmation"
    :open="showConfirmation"
    :buttons="{}"
    :processing="processing"
    :processing-message="processingMessage"
    @close="$emit('close')">
    <smooth-reflow class="flex items-center justify-center">
      <div v-if="reservation">
        <h1 class="text-aba-blue">Thank you for your reservation!</h1>
        <h1 class='title mt-base'>{{data.title}}</h1>
        <div class='date mt-sm'>{{data.formattedDate}}</div>
        <div class='date'>{{data.location}}</div>
        <p class="mt-base text-aba-blue">See you there!</p>
      </div>
    </smooth-reflow>
  </form-popover>
</template>

<script>
import FormPopover from './FormPopover'
import SmoothReflow from '../UI/SmoothReflow'
import { functions } from '../../../lib/firebase'
export default {
  name: 'ReservationConfirm',
  components: { SmoothReflow, FormPopover },
  props: {
    eventId: { type: String, required: true },
    data: { type: Object, required: true }
  },

  data: () => ({
    reservation: null,
    processing: false,
    processingMessage: 'Confirming reservation...'
  }),

  computed: {
    showConfirmation () {
      return !!this.$route.params.token
    }
  },

  created () { if (this.$route.params.token) this.confirmReservation() },

  methods: {
    async confirmReservation () {
      if (!this.$route.params.token) return
      this.processing = true
      const confirmReservation = functions.httpsCallable('reservation-confirm')
      this.reservation = await confirmReservation({ eventId: this.eventId, token: this.$route.params.token })
      this.processing = false
    }
  }
}
</script>

<style lang="scss">
  .reservation-confirm-popover {
  }
</style>
