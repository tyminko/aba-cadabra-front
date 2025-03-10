<template>
  <div
    class="img-trans-overlay"
    :class="{ 'img-trans-overlay--active': active }"
    role="img"
    :aria-label="label">
    <div class="img-trans-overlay__content">
      <slot />
    </div>
    <transition name="fade">
      <div
        v-if="active"
        class="img-trans-overlay__overlay"
        :style="overlayStyle"
        role="presentation">
        <slot name="overlay">
          <div class="img-trans-overlay__default">
            <slot name="overlay-content">
              <i class="material-icons">zoom_in</i>
            </slot>
          </div>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  active?: boolean
  label?: string
  overlayColor?: string
  overlayOpacity?: number
}

const props = withDefault(defineProps<Props>(), {
  active: false,
  label: 'Image with overlay',
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  overlayOpacity: 0.75
})

const overlayStyle = computed(() => ({
  backgroundColor: props.overlayColor,
  opacity: props.overlayOpacity
}))
</script>

<style lang="scss" scoped>
.img-trans-overlay {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &__content {
    width: 100%;
    height: 100%;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;
  }

  &__default {
    color: var(--color-text-light, white);
    font-size: 2rem;
  }

  &:hover &__overlay {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
