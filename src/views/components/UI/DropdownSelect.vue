<template>
  <div v-click-outside="close">
    <label class="px-label block mb-0">
      <span v-if="label" class="label">
        {{label}}
      </span>
    </label>
    <div class="dropdown-select input"
         :class="{open:isOpen, 'float-label-wrap':label}">
      <div class="value" ref="valueEl" @click="isOpen=!isOpen">
        <span class="selected">{{selectedTitle}}</span>
      </div>
      <transition-expand>
        <ul v-show="isOpen"
            @click="isOpen=!isOpen"
            ref="optionsUl"
            :class="{open:isOpen}" class="options">
          <li
            v-for="(title, val) in remainingOptions" :key="val"
            @click="select(val)"
            class="option">
            <span>{{title}}</span>
          </li>
        </ul>
      </transition-expand>
      <button class="compact square" type="button" @click="isOpen=!isOpen">
        <i class="material-icons">{{isOpen ? 'expand_less' : 'expand_more'}}</i>
      </button>
    </div>
  </div>
</template>

<script>
import { TransitionExpand } from 'vue-transition-expand'
import ClickOutside from 'vue-click-outside'

export default {
  components: { TransitionExpand },
  props: {
    value: [String, Number],
    options: { type: [Object, Array], required: true },
    label: String,
    placeholder: String
  },

  data () {
    return {
      isOpen: false
    }
  },

  computed: {
    selectedTitle () {
      if (typeof this.value !== 'undefined') {
        return this.options[this.value]
      }
      return this.placeholder
    },
    remainingOptions () {
      const filtered = {}
      if (Array.isArray(this.options)) {
        this.options.forEach((v, i) => {
          if (i !== this.value) {
            filtered[i] = this.options[i]
          }
        })
      } else {
        Object.keys(this.options).forEach(slug => {
          if (slug !== this.value) {
            filtered[slug] = this.options[slug]
          }
        })
      }
      return filtered
    }
  },

  methods: {
    close () {
      this.isOpen = false
    },
    select (value) {
      this.$emit('input', value)
    },
    setWidth () {
      const optionsUl = this.$refs.optionsUl
      const valueEl = this.$refs.valueEl
      let width = 0
      if (valueEl) {
        valueEl.style.width = null
        width = valueEl.querySelector('span').getBoundingClientRect().width
      }
      if (optionsUl) {
        const display = optionsUl.style.display
        optionsUl.style.visibility = 'hidden'
        optionsUl.style.display = null
        optionsUl.style.position = `absolute`
        optionsUl.style.width = '100%'
        optionsUl.querySelectorAll('span').forEach(el => {
          const w = el.getBoundingClientRect().width
          if (w > width) {
            width = w
          }
        })
        optionsUl.style.width = null
        optionsUl.style.visibility = null
        optionsUl.style.position = null
        optionsUl.style.display = display
      }
      if (valueEl) {
        valueEl.style.width = width + 'px'
      }
    }
  },

  watch: {
    options () {
      this.$nextTick(() => { this.setWidth() })
    }
  },
  mounted () {
    this.setWidth()
  },
  directives: {
    ClickOutside
  }
}
</script>

<style lang="scss">
  .dropdown-select.input {
    position: relative;
    display: inline-flex;
    width: auto;
    align-items: center;
    background: transparent;
    padding: 0;

    user-select: none;
    transition: background 0.2s;
    white-space: nowrap;

    @apply border-aba-blue border-b mb-base;

    &.open {
      z-index: 10;
    }

    .options {
      position: absolute;
      top: 100%;
      left: 0;
      list-style: none;

      display: flex;
      flex-flow: column nowrap;
      width: 100%;
      padding: 0;
      background: #fff;
      box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.05);
      z-index: 20;
      @apply border-aba-blue border-b;
      overflow: hidden;
      transition: height 0.2s
    }

    .value, .option {
      @apply p-sm;
      box-sizing: content-box;
      height: 100%;
      display: flex;
      align-items: center;

      &:active {
        background: rgba(0, 0, 0, 0.1);
      }
    }

    .option:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    button {
      flex-shrink: 0;
      font-size: 80%;
    }

  }
</style>
