<template>
  <form-popover
    :open="open"
    :processing="processing"
    :buttons="buttons"
    :valid="isValid"
    @close="$emit('close')"
    @submit="submit">
    <reservation-form
      ref="reservation"
      :event-data="eventData"
      @processing="processing=$event"
      @update-processing-message="processingMessage=$event"
      @update-buttons="buttons=$event"
      @valid="isValid = $event"/>
  </form-popover>
</template>

<script>
import FormPopover from './FormPopover'
import ReservationForm from './ReservationForm'
export default {
  name: 'ReservationFormPopover',
  components: { ReservationForm, FormPopover },
  props: {
    open: Boolean,
    eventData: { type: Object, required: true }
  },

  data: () => ({
    isValid: false,
    processing: false,
    buttons: undefined,
    processingMessage: ''
  }),

  computed: {},

  methods: {
    async submit () {
      if (this.$refs.reservation) {
        const res = await this.$refs.reservation.submit()
        // !!! DEBUG !!!
        console.log(`%c submit() %c res: `, 'background:#ffbb00;color:#000', 'color:#00aaff', res)
      }
    }
  }
}
</script>

<style lang="scss">
  .reservation-form-popover {
  }
</style>
