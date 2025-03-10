<template>
  <span ref="popperRoot" v-click-outside="hide">
    <transition :name="transitionName" @after-leave="destroyAfterTransition">
      <span v-if="!disabled && showPopper" ref="popper" :id="id" class="popper">
        <span class="popper-content">
          <slot :hide="hide"/>
        </span>
      </span>
    </transition>
    <span ref="reference" class="popper-trigger">
      <slot name="reference" :show="showPopper"/>
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { createPopper, Instance as PopperInstance, Placement } from '@popperjs/core'
import { useId } from '../../../composables/useId'

defineOptions({
  name: 'PopperComponent'
})

interface Props {
  trigger?: string | boolean
  modifiers?: Array<any>
  strategy?: 'absolute' | 'fixed'
  placement?: Placement
  position?: { x: number; y: number }
  disabled?: boolean
  noArrow?: boolean
  arrowSize?: number
  referenceSelector?: string
  boundariesSelector?: string
  boundariesPadding?: number
  delayOnMouseEnter?: number
  delayOnMouseLeave?: number
  forceShow?: boolean
  appendToBody?: boolean
  touchable?: boolean
  enableQuickReset?: boolean
  transition?: string
}

const props = withDefault(defineProps<Props>(), {
  trigger: 'click',
  modifiers: () => [],
  strategy: 'absolute' as const,
  placement: 'auto',
  position: null,
  disabled: false,
  noArrow: false,
  arrowSize: 12,
  referenceSelector: '',
  boundariesSelector: '',
  boundariesPadding: 0,
  delayOnMouseEnter: 100,
  delayOnMouseLeave: 200,
  forceShow: false,
  appendToBody: false,
  touchable: false,
  enableQuickReset: false,
  transition: ''
})

const emit = defineEmits<{
  (e: 'created', state: any): void
  (e: 'toggle', value: boolean): void
  (e: 'show', instance: any): void
  (e: 'hide', instance: any): void
}>()

const popperRoot = ref<HTMLElement | null>(null)
const popper = ref<HTMLElement | null>(null)
const reference = ref<HTMLElement | null>(null)
const referenceEl = ref<HTMLElement | null>(null)
const virtualReferenceEl = ref<any>(null)
const popperInstance = ref<PopperInstance | null>(null)
const showPopper = ref(false)
const timer = ref<number | null>(null)
const id = useId('popper')

const triggerAction = computed(() => {
  return typeof props.trigger === 'boolean' || props.trigger === 'none'
    ? null
    : props.touchable ? 'click' : props.trigger
})

const transitionName = computed(() => {
  return props.transition || triggerAction.value === 'hover' ? 'popper-hover' : 'popper-click'
})

const popperPlacement = computed(() => {
  if (props.placement.startsWith('cursor-')) {
    return props.placement.replace('cursor-', '') as Placement
  } else if (props.placement === ('cursor' as Placement)) {
    return 'auto' as Placement
  }
  return props.placement
})

const popperOptions = computed(() => {
  const options: { placement: Placement; strategy?: 'absolute' | 'fixed'; modifiers?: any[] } = {
    placement: popperPlacement.value
  }
  if (props.strategy) {
    options.strategy = props.strategy
  }

  let modifiers = [
    { name: 'offset', enabled: true, options: { offset: [0, props.noArrow ? 0 : props.arrowSize] } },
    { name: 'arrow', enabled: true, options: { padding: props.arrowSize } },
    { name: 'onFirstUpdate', enabled: true, phase: 'beforeRead' as const, fn: (state: any) => { emit('created', state) } }
  ]

  if (props.boundariesSelector) {
    const boundariesElement = document.querySelector(props.boundariesSelector)
    if (boundariesElement) {
      modifiers = [
        ...modifiers,
        {
          name: 'flip',
          enabled: true,
          options: { padding: props.boundariesPadding || 0 }
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: { padding: props.boundariesPadding || 0 }
        }
      ]
    }
  }

  modifiers = [...modifiers, ...props.modifiers]
  return { ...options, modifiers }
})

watch(() => props.position, (value) => {
  if (props.placement.startsWith('cursor-') && value) {
    const { x, y } = value
    updateVirtualReferenceEl(x, y)
  }
})

watch(() => props.trigger, async (value) => {
  if (typeof props.trigger === 'boolean') {
    if (value) {
      show ()
      await nextTick ()
      const { x, y } = props.position || { x: 0, y: 0 }
      updateVirtualReferenceEl(x, y)
    } else {
      hide ()
    }
  }
})

watch(() => props.arrowSize, () => {
  setArrowSize ()
})

watch(showPopper, async (value) => {
  if (value) {
    await nextTick ()
    popper.value = popperRoot.value?.querySelector('.popper') || null
    updatePopper ()
    emit('toggle', true)
    emit('show', { hide })
  } else {
    if (props.enableQuickReset) {
      destroyPopper ()
    }
    emit('toggle', false)
    emit('hide', { hide })
  }
})

watch(() => props.forceShow, (value) => {
  value ? doShow () : doClose ()
}, { immediate: true })

watch(() => props.disabled, (value) => {
  if (value) {
    showPopper.value = false
  }
})

onMounted(() => {
  setReferenceEl ()
  popper.value = popperRoot.value?.querySelector('.popper') || null
  setArrowSize ()
  setupListenersForTrigger(triggerAction.value)
})

const toggle = async (e?: Event) => {
  if (!props.forceShow) {
    showPopper.value ? hide () : show(e)
  }
}

const showOnMouseEnter = (e: Event) => {
  if (timer.value) clearTimeout(timer.value)
  timer.value = window.setTimeout(() => {
    show(e)
  }, props.delayOnMouseEnter)
}

const hideOnMouseLeave = () => {
  if (timer.value) clearTimeout(timer.value)
  timer.value = window.setTimeout(() => {
    hide ()
  }, props.delayOnMouseLeave)
}

const show = async (e?: Event) => {
  showPopper.value = true
  if (props.placement.startsWith('cursor') && typeof props.trigger !== 'boolean' && e) {
    const mouseEvent = e as MouseEvent
    updateVirtualReferenceEl(mouseEvent.clientX, mouseEvent.clientY)
  }
}

const hide = () => {
  if (!props.forceShow) {
    showPopper.value = false
  }
}

const doShow = () => {
  showPopper.value = true
}

const doClose = () => {
  showPopper.value = false
}

const destroyPopper = () => {
  if (popperInstance.value) {
    popperInstance.value.destroy ()
    popperInstance.value = null
  }
}

const destroyAfterTransition = () => {
  if (!showPopper.value) {
    destroyPopper ()
  }
}

const updatePopper = () => {
  nextTick(() => {
    if (!popperInstance.value) {
      createPopperInstance ()
    } else {
      popperInstance.value.update ()
    }
  })
}

const createPopperInstance = () => {
  destroyPopper ()
  if (referenceEl.value && popper.value) {
    popperInstance.value = createPopper(referenceEl.value, popper.value, popperOptions.value)
  }
}

const setReferenceEl = () => {
  if (props.referenceSelector) {
    referenceEl.value = document.querySelector(props.referenceSelector)
  } else {
    referenceEl.value = reference.value
  }
}

const updateVirtualReferenceEl = (x: number, y: number) => {
  virtualReferenceEl.value = {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x
    })
  }
  referenceEl.value = virtualReferenceEl.value
  updatePopper ()
}

const setArrowSize = () => {
  if (popper.value) {
    const arrow = popper.value.querySelector('.popper-arrow') as HTMLElement
    if (arrow) {
      const size = props.arrowSize
      arrow.style.width = `${size}px`
      arrow.style.height = `${size}px`
    }
  }
}

const setupListenersForTrigger = (trigger: string | null) => {
  if (!trigger) return

  const el = referenceEl.value
  if (!el) return

  if (trigger === 'click') {
    el.addEventListener('click', toggle)
  } else if (trigger === 'hover') {
    el.addEventListener('mouseenter', showOnMouseEnter)
    el.addEventListener('mouseleave', hideOnMouseLeave)
  }
}

defineExpose({
  show,
  hide,
  toggle
})
</script>

<style lang="scss">
.popper {
  position: absolute;
  z-index: 1000;

  &-content {
    position: relative;
    display: inline-block;
  }

  &-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-color: transparent;

    &::before {
      position: absolute;
      content: '';
      border-style: solid;
      border-color: transparent;
    }
  }
}

.popper-click-enter-active,
.popper-click-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.popper-click-enter-from,
.popper-click-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.popper-hover-enter-active,
.popper-hover-leave-active {
  transition: opacity 0.15s;
}

.popper-hover-enter-from,
.popper-hover-leave-to {
  opacity: 0;
}
</style>
