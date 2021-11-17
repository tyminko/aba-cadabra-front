import * as date from '../lib/date'

export default {
  computed: {
    dateDiff () {
      const postDate = (this.post || {}).date
      if (!postDate) return -10
      return date.dateInFuture(postDate)
    },

    upcoming () {
      if ((this.post || {}).type !== 'event') return false
      return this.dateDiff > 1 / 24 * -2
    },

    upcomingLabel () {
      const hour = 1 / 24
      if (this.dateDiff >= hour * 10) return 'Upcoming'
      if (this.dateDiff < hour * 10 && this.dateDiff > hour * -2) return 'Today'
      return ''
    },

    allowReservation () {
      if ((this.post || {}).type !== 'event' || this.dateDiff <= -1 || this.$route.params.token) {
        return false
      }
      const deadlineHours = -1
      const diffHours = this.dateDiff * 24
      return diffHours > deadlineHours
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
  }
}
