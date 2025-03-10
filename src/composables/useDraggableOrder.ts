import { ref, Ref } from 'vue'

interface DraggableItem {
  id: string
  [key: string]: any
}

export function useDraggableOrder<T extends DraggableItem>() {
  const isReordering = ref(false)
  const isDragging = ref(false)
  const draggedId = ref<string | null>(null)
  const sortedItems = ref<T[]>([]) as Ref<T[]>

  const handleDragStart = () => {
    isDragging.value = true
  }

  const handleDragEnd = async (items: T[], setOrder: (order: T[]) => void) => {
    isDragging.value = false
    isReordering.value = true
    try {
      await setOrder(sortedItems.value)
    } finally {
      isReordering.value = false
    }
  }

  return {
    isReordering,
    isDragging,
    draggedId,
    sortedItems,
    handleDragStart,
    handleDragEnd
  }
}
