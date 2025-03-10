<template>
  <div
    class="institutions institutions-editor"
    :aria-busy="isReordering">
    <header class="mb-lg">
      <h1 class="text-2xl font-semibold text-gray-900">Partner Institutions</h1>
      <p class="mt-2 text-sm text-gray-600">Drag and drop to reorder partner institutions</p>
    </header>

    <institutions v-slot="{ institutions, setOrder }">
      <draggable-content
        v-model="sortedInstitutions"
        :disabled="isReordering"
        draggable=".partner-box"
        handle=".drag-handle"
        container-class="grid"
        item-class="partner-box"
        ghost-class="ghost"
        @start="handleDragStart"
        @end="handleDragEnd(institutions, setOrder)">
        <template #item="{ item: institute }">
          <div
            class="partner-box"
            :class="{ 'is-dragging': isDragging && draggedId === institute.id }"
            :aria-label="`${institute.title} - Drag to reorder`"
            role="listitem">
            <div class="partner-content">
              <button
                type="button"
                class="drag-handle"
                aria-label="Drag handle"
                tabindex="0">
                <i class="material-icons" aria-hidden="true">drag_indicator</i>
              </button>

              <div class="partner-info">
                <h2 class="partner-title">{{ institute.title }}</h2>
                <p v-if="institute.location" class="partner-location">
                  <i class="material-icons" aria-hidden="true">location_on</i>
                  {{ institute.location }}
                </p>
              </div>

              <div class="partner-actions">
                <button
                  type="button"
                  class="edit-button"
                  :aria-label="`Edit ${institute.title}`"
                  @click="openEditor(institute)">
                  <i class="material-icons" aria-hidden="true">edit</i>
                </button>
              </div>
            </div>
          </div>
        </template>
      </draggable-content>
    </institutions>

    <div
      v-if="isReordering"
      class="reordering-overlay"
      role="status"
      aria-live="polite">
      <div class="spinner"></div>
      <p>Saving new order...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import type { Store } from 'vuex'
import Institutions from '../components/page-templates/Partners.vue'
import DraggableContent from '../components/UI/DraggableContent.vue'
import { useDraggableOrder } from '@/composables/useDraggableOrder'

interface Institution {
  id: string
  title: string
  location?: string
  order?: number
  [key: string]: any
}

interface RootState {
  editor: {
    type: string
    value: any
  }
}

// Store initialization with proper typing
const store = useStore<RootState>()

// Use the draggable order composable
const {
  isReordering,
  isDragging,
  draggedId,
  sortedItems: sortedInstitutions,
  handleDragStart,
  handleDragEnd
} = useDraggableOrder<Institution>()

// Methods with proper type annotations
const openEditor = (institute: Institution) => {
  store.dispatch('showEditor', {
    type: 'institution',
    value: institute
  })
}
</script>

<style lang="scss" scoped>
.institutions-editor {
  position: relative;
  padding: 2rem;

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
  }

  .partner-box {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;

    &.is-dragging {
      opacity: 0.5;
    }

    &.ghost {
      opacity: 0.5;
      background-color: var(--primary-color-light, #e0e7ff);
    }

    .partner-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .drag-handle {
      cursor: grab;
      color: var(--gray-400, #9ca3af);
      transition: color 0.2s;

      &:hover {
        color: var(--gray-600, #4b5563);
      }

      &:focus {
        outline: 2px solid var(--primary-color, #4f46e5);
        outline-offset: 2px;
      }
    }

    .partner-info {
      flex: 1;
      min-width: 0;
    }

    .partner-title {
      font-weight: 600;
      color: var(--text-color, #111827);
      margin-bottom: 0.25rem;
    }

    .partner-location {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: var(--text-color-light, #6b7280);

      .material-icons {
        font-size: 1rem;
      }
    }

    .partner-actions {
      .edit-button {
        padding: 0.5rem;
        color: var(--gray-400, #9ca3af);
        transition: all 0.2s;
        border-radius: 0.375rem;

        &:hover {
          color: var(--primary-color, #4f46e5);
          background-color: var(--primary-color-light, #e0e7ff);
        }

        &:focus {
          outline: 2px solid var(--primary-color, #4f46e5);
          outline-offset: 2px;
        }
      }
    }
  }
}

.reordering-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 50;

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid var(--primary-color-light, #e0e7ff);
    border-top-color: var(--primary-color, #4f46e5);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: var(--text-color, #111827);
    font-weight: 500;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
