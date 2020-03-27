<template>
  <popover-modal
    ref="popover"
    :open="open"
    class="editor max-w-text w-full"
    @esc="$emit('esc')"
    @close="onClose">
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
          <button class="ml-auto" @click.prevent="onClose">Cancel</button>
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
    processing: Boolean
  },

  data: () => ({}),

  computed: {},

  methods: {
    onClose () {
      this.$emit('close')
      this.$refs.popover.releaseBgScroll()
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
</style>
<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  @import "../../styles/mixins";
  .form-body {
    .dates-row {
      @apply flex flex-row flex-wrap;
      @include wider-then($max-width-phone * 0.8) {
        /*flex-flow: row nowrap;*/
      }
    }
  }
</style>
