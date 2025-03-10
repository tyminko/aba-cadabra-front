<template>
  <PopoverModal
    v-if="open"
    class="popover-dialog"
    :open="open"
    @close="close"
    @esc="close">
    <div class="dialog-box">
      <div class="message">
        {{ message }}
      </div>
      <div class="buttons">
        <button
          v-for="(button, i) in buttons"
          :key="i"
          class="dialog-button"
          @click="respond(button)">
          {{ button.title }}
        </button>
      </div>
    </div>
  </PopoverModal>
</template>

<script setup>
import PopoverModal from './PopoverModal.vue'

// Prop
const props = defineProp({
  open: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true
  },
  buttons: {
    type: Array,
    default: () => [
      { value: 'yes', title: 'Yes' },
      { value: 'no', title: 'No' }
    ]
  }
})

// Emit
const emit = defineEmit(['close', 'response'])

// Method
const close = () => {
  emit('close')
}

const respond = (button) => {
  emit('response', button.value)
  close ()
}
</script>

<style lang="scss">
.popover-dialog {
  .dialog-box {
    padding: 2rem;
    min-width: 300px;
    max-width: 500px;

    .message {
      margin-bottom: 2rem;
      text-align: center;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;

      .dialog-button {
        padding: 0.5rem 2rem;
        border-radius: 4px;
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }
  }
}
</style>
