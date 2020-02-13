<template>
  <div class="home">
    <div class="">
      <div v-for="salon in salons"
           :key="salon.id">
        {{salon.title}}
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../lib/firebase'

export default {
  name: 'Home',
  props: {},

  data: () => ({
    salons: {},
    unsubscribe: null
  }),

  computed: {},

  created () {
    this.getWorks()
  },

  methods: {
    getWorks () {
      this.unsubscribe = db.collection('salons')/* .where('published', '==', true) */
        .onSnapshot(
          querySnapshot => {
            querySnapshot.forEach(doc => {
              const salon = doc.data()
              // if (!work.posterImage && work.hasOwnProperty('attachments')) {
              //   work.posterImage = Object.values(work.attachments).sort((a, b) => a.order - b.order)[0]
              // }
              this.$set(this.salons, doc.id, salon)
            })
          },
          err => {
            // eslint-disable-next-line no-console
            console.error('getSalons:', err)
          }
        )
    }
  }
}
</script>

<style lang='scss'>
  .home {
  }
</style>
