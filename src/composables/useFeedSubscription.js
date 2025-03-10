import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { subscribeToPosts } from '../lib/posts-feed'

export function useFeedSubscription (options = {}) {
  const store = useStore()
  const route = useRoute()

  const feed = ref({})
  const unsubscribe = ref({})
  const processingStatuses = ref({})

  const user = computed(() => store.state.user)
  const showDraftsInGrid = computed(() => store.state.showDraftsInGrid)

  const adminOrEditor = computed(() =>
    !!user.value && (user.value.role === 'admin' || user.value.role === 'editor')
  )

  const authorId = computed(() => {
    if (route.params.filter === 'my') {
      return (user.value || {}).uid
    }
    return route.params.authorId
  })

  const availableSubscriptionStatuses = computed(() => {
    const statuses = ['public']
    if (user.value) {
      statuses.push('internal')

      if (showDraftsInGrid.value &&
        (adminOrEditor.value || !authorId.value || authorId.value === (user.value || {}).uid)) {
        statuses.push('draft')
      }
    }
    return statuses
  })

  const processing = computed(() =>
    Object.values(processingStatuses.value).find(v => v === true)
  )

  const updateSubscriptions = () => {
    // Unsubscribe all not allowed statuses
    Object.keys(unsubscribe.value)
      .filter(status => !availableSubscriptionStatuses.value.includes(status))
      .forEach(status => unsubscribeFeed(status))
    if (unsubscribe.value.draft) unsubscribeFeed('draft') // Just in case if non-editor user has been changed

    // Subscribe for still not subscribed, but available statuses
    availableSubscriptionStatuses.value
      .filter(status => !unsubscribe.value[status])
      .forEach(status => subscribeFeed(status))
  }

  const subscribeFeed = (status) => {
    if (status && !availableSubscriptionStatuses.value.includes(status)) return
    const statuses = status ? [status] : availableSubscriptionStatuses.value
    const subscriptionOptions = { ...options }

    if (authorId.value) subscriptionOptions.authorId = authorId.value

    statuses.forEach(status => {
      if (typeof unsubscribe.value[status] === 'function') return
      processingStatuses.value[status] = true

      if (status === 'draft' && !adminOrEditor.value && !subscriptionOptions.authorId) {
        subscriptionOptions.authorId = user.value.uid
      }

      unsubscribe.value[status] = subscribeToPosts(
        { ...subscriptionOptions, status },
        (id, post) => {
          feed.value[id] = post
        },
        id => delete feed.value[id],
        () => { processingStatuses.value[status] = false }
      )
    })
  }

  const unsubscribeFeed = (status) => {
    const statuses = status ? [status] : Object.keys(unsubscribe.value)
    let unsubscribed = false

    statuses.forEach(status => {
      if (typeof unsubscribe.value[status] === 'function') {
        unsubscribe.value[status]()
        unsubscribe.value[status] = null
        unsubscribed = true
      }
    })

    if (status) {
      if (!unsubscribed) return
      Object.entries(feed.value).forEach(([id, post]) => {
        if (post.status === status) delete feed.value[id]
      })
    } else {
      feed.value = {}
    }
  }

  // Setup watchers
  watch(user, () => {
    updateSubscriptions()
    store.dispatch('setViewCanToggleDrafts', !!user.value)
  })

  watch(showDraftsInGrid, updateSubscriptions)

  // Lifecycle hooks
  onMounted(() => {
    store.dispatch('setViewCanToggleDrafts', !!user.value)
    subscribeFeed()
  })

  onUnmounted(() => {
    store.dispatch('setViewCanToggleDrafts', false)
    unsubscribeFeed()
  })

  return {
    feed,
    processing,
    adminOrEditor,
    authorId
  }
}
