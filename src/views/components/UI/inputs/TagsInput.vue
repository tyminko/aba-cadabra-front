<template>
  <div class="tags-input mb-base">
    <label class="px-label mb-sm">
      <span v-if="labelText" class="label">{{labelText}}</span>
    </label>
    <div class="tags flex flex-wrap items-center">
      <draggable-content
        v-model="tags"
        @move="onMove"
        filter=".search-input"
        :draggable="draggableSelector"
        class="tags-input credits flex flex-wrap items-center">
        <slot :tags="tags"/>
        <div :key="`search-input`"
             draggable="false"
             class="search-input flex items-center">
          <search-input
            ref="tagInput"
            :query="query"
            :placeholder="placeholder || 'Add a person'"
            @blur="onBlur"
            @tab="onInput"
            @input="onInput"/>
          <button v-if="allowCreation" class="add compact" :disabled="noValue" @click="onInput">
            <i class="material-icons text-base">add</i>
          </button>
        </div>
      </draggable-content>
    </div>
  </div>
</template>

<script>
import Tags from '../../../../lib/tags'
import SearchInput from './SearchInput'
import DraggableContent from '../DraggableContent'

export default {
  name: 'TagsInput',
  components: { DraggableContent, SearchInput },
  props: {
    query: {
      type: Function,
      default: string => Tags.query(string)
    },
    createTag: {
      type: Function,
      default: title => Tags.createTag(title, '')
    },
    value: { type: Array, default: () => [] },
    limit: { type: Number, default: 0 },
    deleteOnBackspace: { type: Boolean, default: false },
    allowDuplicates: { type: Boolean, default: false },
    allowCreation: { type: Boolean, default: true },
    isEqual: {
      type: Function,
      default: (a, b) => {
        const slug = tag => tag.title.toLowerCase().replace(/\s/g, '-')
        return slug(a) === slug(b)
      }
    },
    placeholder: { type: String, default: '' },
    label: { type: String, default: '' },
    draggableSelector: String
  },

  data: () => ({
    tags: [],
    text: '',

    input: '',
    oldInput: '',

    searchResults: [],
    searchSelection: 0
  }),

  computed: {
    noValue () {
      return !this.text
    },

    labelText () {
      return this.label || this.placeholder || ''
    },

    placeholderText () {
      return this.placeholder || this.label || ''
    },

    labelVisible () {
      return !!this.model
    }
  },

  watch: {
    value () {
      this.fromValue()
    }
  },

  created () {
    this.fromValue()
  },

  methods: {
    onMove () {
      return true
    },

    suggestionToTag (data) {
      return {
        ...data,
        title: data.title || data.displayName
      }
    },

    tagFromInput ({ search, result }) {
      this.searchResults = result
      let tag = null
      if (!result || Array.isArray(result)) {
        // if no result or the result is array, it means we have no suggestion picked
        if (search && this.allowCreation) {
          tag = this.createTag(search)
        }
      } else {
        // a suggestion is picked
        tag = this.suggestionToTag(result)
      }
      if (tag) {
        this.appendTag(tag)
      }
      this.$refs.tagInput.clear()
    },

    // setText (value) {
    //   this.text = value
    // },

    onBlur (searchObj) {
      this.tagFromInput(searchObj || {})
      // this.setText('')
    },

    onInput (searchObj) {
      this.tagFromInput(searchObj || {})
      // this.setText('')
      this.$refs.tagInput.focus()
    },

    onBackspace () {
      if (!this.input.length && this.deleteOnBackspace) {
        this.onRemoveTag(this.tags.length - 1)
      }
    },

    fromValue () {
      console.log('tagsFromValue()', this.value)
      if (this.value) {
        const tags = Array.isArray(this.value) ? this.value : Object.keys(this.value).map(key => this.value[key])
        if (this.haveDuplicateTags(tags)) {
          return
        }
        if (this.tags.length !== 0) {
          this.tags.splice(0, this.tags.length)
        }
        for (let tag of tags) {
          this.addTag(tag)
        }
      } else {
        if (this.tags.length !== 0) {
          this.tags.splice(0, this.tags.length)
        }
      }
    },

    /**
     * @param {InputTag} tag
     */
    appendTag (tag) {
      console.log('appendTag()', tag)
      if (tag) {
        if (this.addTag(tag)) {
          this.$emit('append', tag)
          // Update the bound v-model value
          this.$emit('input', this.tags)
        }
      }
    },

    /**
     * @param {number} index
     */
    onRemoveTag (index) {
      this.$emit('remove', this.tags[index])
      this.tags.splice(index, 1)
      // Update the bound v-model value
      this.$emit('input', this.tags)
    },

    /**
     * @param {InputTag} tag
     * @return {boolean}
     */
    addTag (tag) {
      // Check if the limit has been reached
      if (this.limit > 0 && this.tags.length >= this.limit) {
        return false
      }
      // Attach the tag if it hasn't been attached yet
      if (this.isDuplicateTag(tag)) {
        return false
      }
      this.tags.push(tag)
      return true
    },

    /**
     * @param {InputTag[]} tags
     * @return {boolean}
     */
    haveDuplicateTags (tags) {
      if (!tags && !this.tags) {
        return true
      }
      if ((tags || []).length !== (this.tags || []).length) {
        return false
      }
      return (Array.isArray(tags) ? [...tags] : [tags]).filter(value => !this.isDuplicateTag(value)).length === 0
    },

    /**
     * @param {InputTag} tag
     * @return {boolean}
     */
    isDuplicateTag (tag) {
      if (this.allowDuplicates) {
        return false
      }
      if (!tag) {
        return false
      }
      return !!this.tags.find(value => this.isEqual(value, tag))
    }
  }
}
</script>

<style lang="scss">
  .tags-input {
    .search-input {
    }
  }
</style>
