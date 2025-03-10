import { computed } from 'vue'
import { useRoute } from 'vue-router'
import * as date from '../lib/date'

export function useReservation (post) {
  const route = useRoute()

  const dateDiff = computed(() => {
    const postDate = post.value?.date
    if (!postDate) return -10
    return date.dateInFuture(postDate)
  })

  const upcoming = computed(() => {
    if (post.value?.type !== 'event') return false
    return dateDiff.value > 1 / 24 * -2
  })

  const upcomingLabel = computed(() => {
    const hour = 1 / 24
    if (dateDiff.value >= hour * 10) return 'Upcoming'
    if (dateDiff.value < hour * 10 && dateDiff.value > hour * -2) return 'Today'
    return ''
  })

  const allowReservation = computed(() => {
    return false
    // if (post.value?.type !== 'event' || dateDiff.value <= -1 || route.params.token) {
    //   return false
    // }
    // const deadlineHours = -1
    // const diffHours = dateDiff.value * 24
    // return diffHours > deadlineHours
  })

  const shouldConfirmReservation = computed(() => {
    const token = route.params.token
    return !!token && (post.value?.reservationsPending || []).includes(token)
  })

  const showReservationConfirmedMessage = computed(() => {
    const token = route.params.token
    return !!token && (post.value?.reservationsConfirmed || []).includes(token)
  })

  return {
    dateDiff,
    upcoming,
    upcomingLabel,
    allowReservation,
    shouldConfirmReservation,
    showReservationConfirmedMessage
  }
}
