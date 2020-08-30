<template>
  <div class="reservation-form relative">
    <h1 class="capitalize px-sm text-aba-blue">Make Reservation</h1>
    <div class="px-sm mt-base mb-xl">
      <h1 class="">{{eventData.eventInfo.title}}</h1>
      <div>{{eventData.eventInfo.secondTittle}}</div>
      <div class="desc">
        <div>{{eventData.eventInfo.dateString}}</div>
        <div>{{eventData.eventInfo.locationString}}</div>
      </div>
    </div>
    <smooth-reflow>
      <template v-if="!response">
        <px-input ref="name" v-model="name" label="Your Name" @blur="validateForm"/>
        <px-input ref="email" v-model="email" label="Email" required @blur="validateForm"/>
      </template>
      <div v-else class="flex flex-col items-center justify-center bg-milk p-sm">
        <div v-html="response"/>
        <a v-if="showRetryButton" href="#" @click.prevent="retry">Try another email address</a>
      </div>
    </smooth-reflow>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { db, functions } from '../../../lib/firebase'
import PxInput from '../UI/inputs/PxInput'
import SmoothReflow from '../UI/SmoothReflow'

export default {
  name: 'ReservationForm',
  components: { SmoothReflow, PxInput },
  props: {
    eventData: { type: Object, required: true },
    formValidator: { type: Function }
  },

  data: () => ({
    name: '',
    email: '',
    deliveryState: '',
    unsubscribeMail: null,
    emailDoc: null,
    error: null
  }),

  computed: {
    ...mapState(['user']),
    response () {
      if (this.error) {
        if (this.error.toString() === 'Error: Reservation already confirmed.') {
          return `<h1 class="mt-base mb-xxl">Reservation for ${this.email}<br>has been already confirmed.</h1>`
        }
        return `<p class="text-red-700">${this.error}</p>`
      }
      switch (this.deliveryState) {
        case 'ERROR':
          return `<p class="text-red-700">Sorry, there was an error during email delivery to the address: ${this.email}.</p>`
        case 'SUCCESS':
          return `${this.name ? this.name + ', ' : ''}<h1 class="text-aba-blue my-sm">Please, confirm your reservation!</h1>
<p>We have sent you an Email with the confirmation link.</p>
<div class="desc mt-base">In case you don't see the email in your <span class="italic font-medium">Inbox</span>,<br>
please also check your <span class="italic font-medium">Spam/Junk</span> folder.</div>`
        case 'PENDING':
        case 'PROCESSING':
        default:
          return ''
      }
    },
    showRetryButton () {
      return this.error || this.deliveryState === 'ERROR'
    }
  },

  created () {
    this.$emit('update-buttons', undefined)
  },

  beforeDestroy () {
    this.unsubscribeMailDoc()
  },

  methods: {
    validateForm () {
      let valid = true
      if (this.$refs.email) {
        valid = this.$refs.email.isValid
      }
      if (this.$refs.email) {
        valid = this.$refs.email.isValid
      }
      this.$emit('valid', valid)
      return valid
    },

    async submit () {
      if (!this.validateForm()) return
      const reservationData = {
        ...this.eventData,
        email: this.email,
        name: this.name
      }
      try {
        this.$emit('processing', true)
        const makeReservation = functions.httpsCallable('reservation-make')
        const reservationId = await makeReservation(reservationData)
        if (reservationId) {
          this.$emit('update-processing-message', 'Sending Email...')
          this.unsubscribeMail = db.collection('mail')
            .doc(this.user.uid)
            .onSnapshot(doc => {
              this.emailDoc = doc.data()
              if ((this.emailDoc || {}).delivery) {
                this.deliveryState = this.emailDoc.delivery.state
                if (this.deliveryState === 'SUCCESS' || this.deliveryState === 'ERROR') {
                  this.error = this.emailDoc.delivery.error || null
                  this.$emit('processing', false)
                  this.$emit('update-buttons', { close: this.error ? 'Cancel' : 'OK' })
                }
              }
            }, error => {
              this.error = error
              console.error('Send Email:', error)
              this.deliveryState = 'ERROR'
              this.$emit('processing', false)
              this.$emit('update-buttons', { close: 'Cancel' })
            })
        }
      } catch (error) {
        this.error = error
        console.error('Send Email:', error)
        this.$emit('processing', false)
        this.$emit('update-buttons', { close: 'Cancel' })
      }
    },

    retry () {
      this.unsubscribeMailDoc()
      this.error = null
      this.email = ''
      this.$emit('update-buttons', { close: 'Cancel', submit: 'Submit' })
      this.$nextTick(() => {
        if (this.$refs.email) this.$refs.email.focus()
      })
    },

    unsubscribeMailDoc () {
      if (typeof this.unsubscribeMail === 'function') {
        this.unsubscribeMail()
      }
      this.unsubscribeMail = null
      this.emailDoc = null
      this.deliveryState = ''
    }
  }
}
</script>

<style lang="scss">
  .reservation-form {
    margin-top: 0 !important;
  }
</style>
