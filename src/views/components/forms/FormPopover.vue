<template>
  <popover-modal
    ref="popover"
    :open="open"
    class="max-w-text w-full"
    @esc="$emit('esc')"
    @close="close">
    <template v-slot:header>
      <slot name="header">
        <h1 v-if="title" class="capitalize px-sm text-aba-blue">{{title}}</h1>
      </slot>
    </template>
    <form
      class="pb-sm"
      @submit.prevent="$emit('submit')"
      @keyup.enter.prevent="() => false">
      <div ref="" class="form-body px-base overflow-auto">
        <slot />
      </div>
      <footer class="flex h-base items-center px-sm">
        <slot name="footer" />
        <template v-if="!processing">
          <button v-if="buttons.close" class="ml-auto" @click.prevent="close">{{buttons.close}}</button>
          <button v-if="buttons.submit" :disabled="!valid" type="submit">{{buttons.submit}}</button>
        </template>
<!--        <span v-else>Processing...</span>-->
      </footer>
    </form>
    <div v-if="processing" class="progress-overlay absolute w-full h-full inset-0 flex items-center justify-center z-50 bg-milk">
      <div class="text-xl text-aba-blue">{{processingMessage}}</div>
    </div>
  </popover-modal>
</template>

<script>
import PopoverModal from '../UI/PopoverModal'

export default {
  name: 'FormPopover',
  components: { PopoverModal },
  props: {
    open: Boolean,
    processing: Boolean,
    valid: Boolean,
    title: { type: String },
    buttons: { type: Object, default: () => ({ close: 'Cancel', submit: 'Submit' }) },
    processingMessage: { type: String, default: 'Processing...' }
  },

  data: () => ({}),

  methods: {
    close () {
      this.$emit('close')
      if (this.$refs.popover) {
        this.$refs.popover.releaseBgScroll()
      }
    }
  }
}
</script>

<style lang="scss">
  .form-popover {
  }
</style>
