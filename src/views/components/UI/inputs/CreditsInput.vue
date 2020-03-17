<template>
  <div class="credits-input">
    <tags-input :query="profileQuery">
      <template v-slot:default="{tags}">
        <div class="credits">
          <div
            v-for="(profile, i) in tags"
            :key="i"
            class="credit-item flex items-center">
            <span>{{profile.displayName}}</span>
            <button class="compact" @click="toggleStar(profile.id)">
              <i class="material-icons">
                {{stars.includes(profile.id) ? 'star' : 'star_border' }}
              </i>
            </button>
          </div>
        </div>
      </template>
    </tags-input>
  </div>
</template>

<script>
import { db } from '../../../../lib/firebase'
import TagsInput from './TagsInput'

export default {
  name: 'CreditsInput',
  components: { TagsInput },
  props: {
    value: Array
  },

  data: () => ({
    profileQuery: (str) => {
      return db.collection('profiles')
        .where('searchIndices', 'array-contains', str.toLowerCase())
        .get()
        .then(snapshot => snapshot.docs.reduce((result, doc) => {
          return [...result, { id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }]
        }, []))
    },
    stars: []
  }),

  computed: {},

  methods: {
    toggleStar (profileId) {
      const index = this.stars.indexOf(profileId)
      if (index < 0) {
        this.stars.push(profileId)
      } else {
        this.stars.splice(index, 1)
      }
    }
  }
}
</script>

<style lang="scss">
  .credits-input {
  }
</style>
