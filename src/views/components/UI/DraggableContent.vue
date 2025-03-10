<template>
  <div
    class="draggable-content"
    role="region"
    :aria-label="label">
    <draggable
      v-model="modelValue"
      v-bind="dragOptions"
      :disabled="disabled"
      item-key="id"
      tag="transition-group"
      :component-data="{
        tag: 'div',
        name: !disabled ? 'flip-list' : undefined,
        type: 'transition-group',
        class: 'draggable-content__list'
      }"
      @start="onDragStart"
      @end="onDragEnd">
      <template #item="{ element, index }">
        <div
          class="draggable-content__item"
          :class="{ 'draggable-content__item--dragging': isDragging }"
          role="listitem"
          :aria-grabbed="isDragging"
          :aria-dropeffect="isDragging ? 'move' : undefined">
          <slot
            name="item"
            :item="element"
            :index="index"
            :is-dragging="isDragging" />
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Draggable from 'vuedraggable'

interface Props {
  modelValue: any[]
  disabled?: boolean
  label?: string
  handle?: string
  animation?: number
  ghostClass?: string
}

const props = defineProps<Props>()
const emit = defineEmit(['update:modelValue', 'dragstart', 'dragend'])

const isDragging = ref(false)

const dragOptions = computed(() => ({
  animation: props.animation || 200,
  disabled: props.disabled,
  ghostClass: props.ghostClass || 'ghost',
  handle: props.handle
}))

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const onDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('dragstart', event)
}

const onDragEnd = (event: DragEvent) => {
  isDragging.value = false
  emit('dragend', event)
}
</script>

<style lang="scss" scoped>
.draggable-content {
  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__item {
    position: relative;
    transition: all 0.3s ease;

    &--dragging {
      opacity: 0.5;
      cursor: grabbing;
    }
  }
}

.flip-list-move {
  transition: transform 0.3s ease;
}

.ghost {
  opacity: 0.5;
  background: var(--color-bg-ghost, #f3f4f6);
}
</style>
