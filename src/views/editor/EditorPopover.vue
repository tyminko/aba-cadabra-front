<template>
  <popover-modal
    ref="popover"
    :open="open"
    class="editor max-w-text w-full"
    @esc="$emit('esc')"
    @close="close">
    <template v-slot:header>
      <slot name="header">
        <h1 class="capitalize px-sm text-aba-blue">{{type}}</h1>
      </slot>
    </template>
    <form
      class="post-editor pb-base"
      @submit.prevent="$emit('save')"
      @keyup.enter.prevent="() => false">
      <div ref="" class="form-body px-base pb-base overflow-auto">
        <slot />
      </div>
      <footer class="flex h-base items-center px-sm">
        <slot name="footer" />
        <template v-if="!processing">
          <button class="ml-auto" @click.prevent="close">Cancel</button>
          <button type="submit">Save</button>
        </template>
        <span v-else>Processing...</span>
      </footer>
    </form>
  </popover-modal>
</template>

<script>
import PopoverModal from '../components/UI/PopoverModal'

export default {
  name: 'EditorPopover',
  components: { PopoverModal },
  props: {
    open: Boolean,
    processing: Boolean,
    type: { type: String }
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

<!--suppress CssInvalidFunction -->
<style lang="css">
  .form-body {
    max-height: calc(100vh - theme('padding.base') * 3 - theme('spacing.base') * 2);
  }
  .form-body .px-label.mb-0 {
    @apply mb-0;
  }
  .form-body > :first-child { @apply mt-base }
</style>
