<template>
  <div class="credits-input">
    <tags-input
      v-model="model"
      label="Participants"
      draggable-selector=".credit-item"
      placeholder="Add person"
      :query="profileQuery"
      :allow-creation="false">
      <template v-slot:default="{tags}">
        <div v-for="profile in tags"
             :key="profile.id"
             class="credit-item flex items-center h-2/3base mr-sm mb-sm bg-gray-200">
          <span class="pl-sm">{{profile.displayName}}</span>
          <button class="h-2/3base w-2/3base" @click="toggleStar(profile.id)">
            <i class="material-icons text-base"
               :class="stars.includes(profile.id) ? `text-gray-900` : `text-gray-500`">
              {{stars.includes(profile.id) ? 'star' : 'star_border' }}
            </i>
          </button>
          <button class="h-2/3base w-2/3base" @click="removeProfile(profile.id)">
            <i class="material-icons text-base text-gray-500">close</i>
          </button>
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
    value: { type: Array, default: () => ([]) }
  },

  data: () => ({
    profileQuery: (str) => {
      return db.collection('profiles')
        .where('searchIndices', 'array-contains', str.toLowerCase())
        .get()
        .then(snapshot => snapshot.docs.reduce((result, doc) => {
          const profileRef = { id: doc.id, displayName: doc.data().displayName || '' }
          return [...result, profileRef]
        }, []))
    },
    stars: []
  }),

  computed: {
    model: {
      get () { return this.value },
      set (newValue) {
        this.$emit('input', newValue)
      }
    }
  },

  methods: {
    removeProfile (id) {
      this.$emit('input', this.model.filter(p => p.id !== id))
    },

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

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .credits-input {
    .search-input {
      @apply mb-sm;
    }
  }
</style>
