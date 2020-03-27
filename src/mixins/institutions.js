import { db } from '../lib/firebase'

export default {
  data: function () {
    return {
      unsubscribeFunc: null,
      institutions: {}
    }
  },

  created () {
    this.subscribe()
  },

  beforeDestroy () {
    this.unsubscribe()
  },

  methods: {
    subscribe () {
      this.unsubscribeFunc = db.collection('institutions')
        .onSnapshot({
          next: querySnapshot => {
            querySnapshot.docChanges().forEach(docChange => {
              const doc = docChange.doc
              switch (docChange.type) {
                case 'added':
                case 'modified':
                  this.$set(this.institutions, doc.id, { ...doc.data(), id: doc.id })
                  break
                case 'removed':
                  this.$delete(this.institutions, doc.id)
              }
            })
          },
          error: err => {
            console.error('Institutions subscribe:', err)
          }
        })
    },
    unsubscribe () {
      if (typeof this.unsubscribeFunc === 'function') this.unsubscribeFunc()
      this.unsubscribeFunc = null
    }
  }
}
