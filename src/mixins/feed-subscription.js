import { mapActions, mapState } from 'vuex'
import { subscribeToPosts } from '../lib/posts-feed'

export default {
  data: () => ({
    feed: {},
    unsubscribe: {},
    processingStatuses: {},
    subscriptionPostType: null
  }),

  computed: {
    ...mapState(['user', 'showDraftsInGrid']),

    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },

    authorId () {
      if (this.$route.params.filter === 'my') {
        return this.user.uid
      }
      return this.$route.params.authorId
    },

    availableSubscriptionStatuses () {
      const statuses = ['public']
      if (this.user) {
        statuses.push('internal')

        if (this.showDraftsInGrid &&
          (this.adminOrEditor || !this.authorId || this.authorId === this.user.uid)) {
          statuses.push('draft')
        }
      }
      return statuses
    },

    processing () {
      return Object.values(this.processingStatuses).find(v => v === true)
    }
  },

  created () {
    this.setViewCanToggleDrafts(true)
    this.subscribeFeed()
  },

  watch: {
    user () { this.updateSubscriptions() },
    $route () {
      this.setViewCanToggleDrafts(true)
      this.updateSubscriptions()
    },
    authorId () {
      this.setViewCanToggleDrafts(true)
      this.unsubscribeFeed()
      this.updateSubscriptions()
    },
    showDraftsInGrid () { this.updateSubscriptions() }
  },

  beforeDestroy () {
    this.setViewCanToggleDrafts(false)
    this.unsubscribeFeed()
  },

  methods: {
    ...mapActions(['setViewCanToggleDrafts']),

    updateSubscriptions () {
      // Unsubscribe all not allowed statuses
      Object.keys(this.unsubscribe)
        .filter(status => !this.availableSubscriptionStatuses.includes(status))
        .forEach(status => this.unsubscribeFeed(status))
      if (this.unsubscribe.draft) this.unsubscribeFeed('draft') // Just in case if non-editor user has been changed

      // Subscribe for still not subscribed, but available statuses
      this.availableSubscriptionStatuses
        .filter(status => !this.unsubscribe[status])
        .forEach(status => this.subscribeFeed(status))
    },

    subscribeFeed (status) {
      if (status && !this.availableSubscriptionStatuses.includes(status)) return
      const statuses = status ? [status] : this.availableSubscriptionStatuses
      const options = {}
      if (this.subscriptionPostType) options.type = this.subscriptionPostType
      if (this.authorId) options.authorId = this.authorId
      // !!! DEBUG !!!
      console.log(`%c subscribeFeed() %c options: `, 'background:#ffbb00;color:#000', 'color:#00aaff', options)
      statuses.forEach(status => {
        if (typeof this.unsubscribe[status] === 'function') return
        this.$set(this.processingStatuses, status, true)
        if (status === 'draft' && !this.adminOrEditor && !options.authorId) {
          options.authorId = this.user.uid
        }
        this.unsubscribe[status] = subscribeToPosts(
          { ...options, status },
          (id, post) => this.$set(this.feed, id, post),
          id => this.$delete(this.feed, id),
          () => { this.$set(this.processingStatuses, status, false) }
        )
      })
    },

    unsubscribeFeed (status) {
      const statuses = status ? [status] : Object.keys(this.unsubscribe)
      let unsubscribed = false
      statuses.forEach(status => {
        if (typeof this.unsubscribe[status] === 'function') {
          this.unsubscribe[status]()
          this.unsubscribe[status] = null
          unsubscribed = true
        }
      })
      if (status) {
        if (!unsubscribed) return
        Object.entries(this.feed).forEach(([id, post]) => {
          if (post.status === status) this.$delete(this.feed, id)
        })
      } else {
        this.feed = {}
      }
    }
  }
}
