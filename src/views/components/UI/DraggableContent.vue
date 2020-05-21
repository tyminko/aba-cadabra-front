<template>
  <draggable
    v-model="model"
    v-bind="dragOptions"
    class="draggable-content"
    :filter="filter"
    :draggable="draggable"
    @start="dragging = true"
    @end="onEnd">
    <transition-group
      type="transition"
      :class="containerClass"
      :name="!dragging ? 'flip-list' : null">
      <slot />
    </transition-group>
  </draggable>
</template>

<script>
import Draggable from 'vuedraggable'
export default {
  name: 'DraggableContent',
  components: { Draggable },
  props: {
    value: { type: Array, required: true },
    filter: String,
    draggable: { type: String, default: '>*' },
    containerClass: String,
    options: { type: Object, default: () => ({}) }
  },

  data: () => ({
    dragging: false
  }),

  computed: {
    model: {
      get () { return this.value },
      set (newValue) {
        this.$emit('input', newValue)
      }
    },
    dragOptions () {
      return {
        animation: 200,
        group: 'tabs',
        disabled: false,
        ghostClass: 'ghost',
        ...this.options
      }
    }
  },

  methods: {
    onEnd (e) {
      this.dragging = false
      this.$emit('end', e)
    }
  }
}
</script>

<style lang="scss">
  .flip-list-move {
    transition: transform 0.5s;
  }
  .no-move {
    transition: transform 0s !important;
  }
  .ghost {
    opacity: 0.5;
  }
</style>
