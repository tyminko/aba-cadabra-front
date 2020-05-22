<template>
  <div class="credits-input">
    <tags-input
      v-model="model"
      :label="label"
      :placeholder="placeholder"
      draggable-selector=".credit-item"
      :query="profileQuery"
      :allow-creation="false">
      <template v-slot:default="{tags}">
        <div v-for="profile in tags"
             :key="profile.id"
             class="credit-item flex items-center h-2/3base mr-sm mb-sm bg-gray-200">
          <span class="pl-sm">{{profile.displayName}}</span>
          <button class="h-2/3base w-2/3base" @click.prevent="toggleStar(profile.id)">
            <i class="material-icons text-base"
               :class="stars.includes(profile.id) ? `text-gray-900` : `text-gray-500`">
              {{ stars.includes(profile.id) ? 'star' : 'star_border' }}
            </i>
          </button>
          <button class="h-2/3base w-2/3base" @click.prevent="removeProfile(profile.id)">
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
    value: { type: Array, default: () => ([]) },
    label: { type: String, default: 'Participants' },
    placeholder: { type: String, default: 'Add person' }
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
    }
  }),

  computed: {
    model: {
      get () { return this.value },
      set (newValue) {
        this.$emit('input', newValue)
      }
    },
    stars () {
      return this.model.reduce((res, p) => p.star ? [...res, p.id] : res, [])
    }
  },

  methods: {
    removeProfile (id) {
      this.$emit('input', this.model.filter(p => p.id !== id))
    },

    toggleStar (profileId) {
      const index = this.value.findIndex(p => p.id === profileId)
      // !!! DEBUG !!!
      console.log(`%c toggleStar() %c index: `, 'background:#ffbb00;color:#000', 'color:#00aaff', index)
      if (index > -1) {
        const newVal = [...this.value]
        if (newVal[index].star) {
          delete newVal[index].star
        } else {
          newVal[index].star = true
        }
        // !!! DEBUG !!!
        console.log(`%c toggleStar() %c newVal: `, 'background:#ffbb00;color:#000', 'color:#00aaff', newVal)
        this.$emit('input', newVal)
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
