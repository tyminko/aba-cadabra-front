<template>
  <div class="tags-input-root">
    <draggable v-model="tags"
               :move="onMove"
               :group="{ name: 'people', pull: 'clone', put: false }"
               :sortable="true"
               class="tags-input"
               handle=".tag-handle">
      <slot :tags="tags" />
      <div class="popper-ref input-wrapper">
        <search-input
          ref="tagInput"
          :query="query"
          :placeholder="placeholder || $t('tag.Add a tag')"
          @typing="setText"
          @blur="onBlur"
          @tab="onInput"
          @input="onInput" />
        <button
          class="add micro"
          :disabled="noValue"
          @click="onInput">
          <i class="ti-plus" />
        </button>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable/src/vuedraggable'
import Tags from '../../../lib/tags'
import SearchInput from '../UI/SearchInput'

export default {
  name: 'TagsInput',
  components: { draggable, SearchInput },
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
    placeholder: { type: String, default: '' }
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

    setText (value) {
      this.text = value
    },

    onBlur (searchObj) {
      this.tagFromInput(searchObj)
      this.setText('')
    },

    onInput (searchObj) {
      this.tagFromInput(searchObj)
      this.setText('')
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
  @import "../../../assets/styles/vars";
  @import "../../../assets/styles/mixins";

  .input-wrapper {
    position: relative;
    margin: 0 0 $tag-padding;

    .auto-complete-placeholder {
      position: absolute;
      height: $tag-inline-height;
      display: flex;
      align-items: center;
      padding: $tag-padding;
      top: 1px; // offset to compensate input border width
      left: 1px; // offset to compensate input border width
      opacity: 0.3;
      @include noselect;
    }

    button.add {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: $tag-inline-height;
      width: $tag-inline-height;
      border-radius: 0 $tag-corner-radius $tag-corner-radius 0;
    }
  }

  .profile-wrapper {
    .auto-complete-placeholder {
      height: $basic-size;
    }
  }
</style>
