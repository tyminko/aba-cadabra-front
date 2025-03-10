<template>
  <div class='aba-blog'>
  </div>
</template>

<script>
import { db } from '../../../lib/firebase'

export default {
  name: 'AboutPage',
  components: { },
  props: {},

  data: () => ({
    profiles: {},
    unsubscribe: null
  }),

  created () {
    this.subscribeResident ()
  },

  computed: {},

  methods: {
    subscribeResident () {
      this.unsubscribe = db.collection('profiles')
        .where('residencyStart', '>', 0)
        .orderBy('residencyStart', 'desc')
        .onSnapshot(
          querySnapshot => {
            querySnapshot.docChange ().forEach(docChange => {
              const doc = docChange.doc
              switch (docChange.type) {
                case 'added':
                case 'modified':
                  this.$set(this.profiles, doc.id, { ...doc.data (), id: doc.id })
                  break
                case 'removed':
                  this.$delete(this.profiles, doc.id)
              }
            })
          },
          error => {
            console.error('%c SUBSCRIBE RESIDENTS %c ERROR: ', 'background:#ff0000;color:#000', 'color:#00aaff', error)
          })
    }
  },

  beforeUnmount () {
    if (typeof this.unsubscribe === 'function') this.unsubscribe ()
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang='scss'>

</style>
