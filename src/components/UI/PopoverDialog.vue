<template>
  <popover-modal v-if="open" class="popover-dialog" :open="open" @colose="close">
    <div class="dialog-box">
      <div class="message">
        {{ message }}
      </div>
      <div class="buttons">
        <button v-for="(button, i) in buttons" :key="i" @click="respond(button)">
          {{ button.title }}
        </button>
      </div>
    </div>
  </popover-modal>
</template>

<script>
import PopoverModal from './PopoverModal'

export default {
  name: 'PopoverDialog',
  components: {
    PopoverModal
  },

  props: {
    open: Boolean,
    message: { type: String, required: true },
    buttons: {
      type: Array,
      default: () => [
        { value: 'yes', title: 'Yes' },
        { value: 'no', title: 'No' }
      ]
    }
  },

  data: () => ({
  }),

  computed: {
  },

  methods: {
    close () {
      this.$emit('cencel')
    }
  }
}
</script>

<style lang='scss'>
  .popover-dialog{
  position: relative;
  }
</style>
