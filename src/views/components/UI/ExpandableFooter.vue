<template>
  <footer
    class="expandable-footer"
    :class="{ 'expandable-footer--expanded': isExpanded }"
    role="contentinfo">
    <button
      class="expandable-footer__toggle"
      :aria-expanded="isExpanded"
      :aria-controls="contentId"
      @click="toggle">
      <span class="expandable-footer__toggle-text">
        {{ isExpanded ? 'Show Less' : 'Show More' }}
      </span>
      <i class="material-icons expandable-footer__toggle-icon">
        {{ isExpanded ? 'expand_less' : 'expand_more' }}
      </i>
    </button>

    <transition name="expand">
      <div
        v-if="isExpanded"
        :id="contentId"
        class="expandable-footer__content">
        <slot />
      </div>
    </transition>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Generate unique ID for ARIA attribute
const contentId = `footer-content-${Math.random ().toString(36).substr(2, 9)}`

interface Props {
  expanded?: boolean
}

const props = withDefault(defineProps<Props>(), {
  expanded: false
})

const emit = defineEmits<{
  (e: 'update:expanded', value: boolean): void
  (e: 'toggle', value: boolean): void
}>()

const isExpanded = ref(props.expanded)

const toggle = () => {
  isExpanded.value = !isExpanded.value
  emit('update:expanded', isExpanded.value)
  emit('toggle', isExpanded.value)
}
</script>

<style lang="scss" scoped>
.expandable-footer {
  position: relative;
  width: 100%;
  background-color: var(--color-bg-footer, #f9fafb);
  border-top: 1px solid var(--color-border, #e5e7eb);

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    color: var(--color-text-secondary, #6b7280);
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-aba-blue, #4f46e5);
      background-color: var(--color-bg-hover, #f3f4f6);
    }
  }

  &__toggle-text {
    margin-right: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  &__toggle-icon {
    font-size: 1.25rem;
    transition: transform 0.2s ease;
  }

  &__content {
    padding: 1.5rem;
    border-top: 1px solid var(--color-border, #e5e7eb);
  }

  &--expanded {
    .expandable-footer__toggle-icon {
      transform: rotate(180deg);
    }
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 300px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
