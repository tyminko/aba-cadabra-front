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
        :draggable="draggableSelector || '.tag-item'"
        container-class="flex items-center flex-wrap"
        class="tags-input credits flex flex-wrap items-center">
        <slot :tags="tags">
          <div v-for="tag in tags"
               :key="tag.id"
               class="tag-item flex items-center h-2/3base mr-sm mb-sm bg-aba-blue text-white text-sm font-thin capitalize">
            <span class="pl-sm" :class="{italic:tag.new}">{{tag.title}}</span>
            <button class="h-2/3base w-2/3base" @click="removeTag(tag.id)">
              <i class="material-icons text-base text-white opacity-50">close</i>
            </button>
          </div>
        </slot>
        <div :key="`search-input`"
             draggable="false"
             class="search-input flex items-center mb-sm">
          <search-input
            ref="tagInput"
            :query="query"
            :placeholder="placeholder || 'Add tag'"
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
        const slug = tag => (tag.title || tag.displayName).toLowerCase().replace(/\s+/g, '-')
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
      if (result && result.id && (result.title || result.displayName)) {
        // we have a selected suggestion
        tag = { ...result }
      } else if (Array.isArray(result)) {
        // there are suggestions, but non is selected
        search = search.toLocaleLowerCase()
        const index = result.findIndex(suggestion => (suggestion.title || suggestion.displayName) === search)
        if (index > -1) {
          tag = { ...result[index] }
        }
      }
      if (!tag && search && this.allowCreation) {
        tag = this.createTag(search)
      }
      if (tag) {
        this.appendTag(tag)
      }
      this.$refs.tagInput.clear()
    },

    onBlur (searchObj) {
      this.tagFromInput(searchObj || {})
    },

    onInput (searchObj) {
      this.tagFromInput(searchObj || {})
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
        const tags = Array.isArray(this.value)
          ? this.value
          : Object.keys(this.value).map(key => this.value[key])
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
     * @param {Tag} tag
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
     * @param {Tag} tag
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

    removeTag (id) {
      const index = this.tags.findIndex(t => t.id === id)
      if (index < 0) return
      this.tags.splice(index, 1)
      this.$emit('input', this.tags)
    },

    /**
     * @param {Tag[]} tags
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
     * @param {Tag} tag
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
  }
</style>
