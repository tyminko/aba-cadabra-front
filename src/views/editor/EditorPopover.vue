<template>
  <popover-modal
    ref="popover"
    :open="open"
    class="editor max-w-text w-full"
    @esc="emit('esc')"
    @close="close">
    <template v-slot:header>
      <slot name="header">
        <h1 class="capitalize px-sm text-aba-blue">{{type}}</h1>
      </slot>
    </template>
    <form
      class="post-editor pb-base"
      @submit.prevent="emit('save')"
      @keyup.enter.prevent="() => false">
      <div
        class="form-body px-base pb-base overflow-auto"
        :class="buttons.delete ? 'opacity-25':''">
        <slot />
      </div>
      <footer class="flex h-base items-center px-sm">
        <slot name="footer" />
        <template v-if="!processing">
          <button v-if="buttons.close" class="ml-auto" @click.prevent="close">{{buttons.close}}</button>
          <button v-if="buttons.submit" :disabled="!valid" type="submit">{{buttons.submit}}</button>
          <button v-if="buttons.delete"
                  class="text-red-600"
                  @click.prevent="emit('remove')">
            {{buttons.delete}}
          </button>
        </template>
      </footer>
    </form>
  </popover-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PopoverModal from '../components/UI/PopoverModal.vue'

defineOptions({
  name: 'EditorPopover'
})

interface Props {
  open?: boolean
  valid?: boolean
  processing?: boolean
  type?: string
  buttons?: {
    close?: string
    submit?: string
    delete?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  valid: false,
  processing: false,
  type: '',
  buttons: () => ({ close: 'Cancel', submit: 'Save' })
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'remove'): void
  (e: 'esc'): void
}>()

const popover = ref<InstanceType<typeof PopoverModal> | null>(null)

const close = () => {
  emit('close')
  if (popover.value && 'releaseBgScroll' in popover.value) {
    (popover.value as any).releaseBgScroll ()
  }
}
</script>

<!--suppress CssInvalidFunction -->
<style lang="css">
  .form-body {
    max-height: calc(100vh - theme('padding.base') * 3 - theme('spacing.base') * 2);
  }
  .form-body .px-label.mb-0 {
    margin-bottom: 0;
  }
  .form-body > :first-child { @apply mt-base }
</style>
