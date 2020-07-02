<template>
  <div class="residency">
    <h1>Residents:</h1>
    <div class="grid pt-lg">
      <profile-cell v-for="profile in profiles" :key="profile.id" :profile="profile"/>
    </div>
  </div>
</template>

<script>
import { db } from '../../../lib/firebase'
import ProfileCell from '../ProfileCell'

export default {
  name: 'Residency',
  components: { ProfileCell },
  props: {},

  data: () => ({
    profiles: {},
    unsubscribe: null
  }),

  created () {
    this.subscribeResidents()
  },

  computed: {},

  methods: {
    subscribeResidents () {
      this.unsubscribe = db.collection('profiles')
        .where('residencyStart', '>', 0)
        .orderBy('residencyStart', 'desc')
        .onSnapshot(
          querySnapshot => {
            querySnapshot.docChanges().forEach(docChange => {
              const doc = docChange.doc
              switch (docChange.type) {
                case 'added':
                case 'modified':
                  this.$set(this.profiles, doc.id, { ...doc.data(), id: doc.id })
                  break
                case 'removed':
                  this.$delete(this.profiles, doc.id)
              }
            })
          },
          error => {
            console.error(`%c SUBSCRIBE RESIDENTS %c ERROR: `, 'background:#ff0000;color:#000', 'color:#00aaff', error)
          })
    }
  },

  beforeDestroy () {
    if (typeof this.unsubscribe === 'function') this.unsubscribe()
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .residency {
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-auto-rows: auto;
      grid-auto-flow: dense;

      @apply gap-lg;
      max-width: 100%;
    }
  }
</style>
