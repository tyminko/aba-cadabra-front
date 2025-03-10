<template>
  <!--suppress HtmlFormInputWithoutLabel -->
  <input
    :type="type"
    v-model="modelValue"
    v-input-auto-width="autoWidthOptions"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :spellcheck="spellcheck"
    :id="inputId"
    :aria-label="placeholder"
    @click="focus"
    @focus="emit('focus')"
    @blur="emit('blur')"
    @change="emit('change')"
    @keydown.down="emit('arrow-down')"
    @keydown.up="emit('arrow-up')"
    @keydown.enter.prevent="emit('enter')"
    @keyup.exact="emit('keyup')"
    @keydown.esc="onEsc">
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import inputAutoWidth from 'vue-input-autowidth'
import { useId } from '../../../../composables/useId'

// Prop
const props = defineProp({
  modelValue: [String, Number],
  autocomplete: String,
  disabled: Boolean,
  spellcheck: Boolean,
  placeholder: [String, Number],
  type: { type: String, default: 'text' },
  minWidth: { type: [String, Number], default: 0 },
  comfortZone: { type: [String, Number], default: 0 }
})

// Emit
const emit = defineEmit([
  'update:modelValue',
  'focus',
  'blur',
  'change',
  'arrow-down',
  'arrow-up',
  'enter',
  'keyup',
  'esc'
])

// Constant
const DEFAULT_MIN_WIDTH = 96

// Generate unique ID
const inputId = useId('input-flex')
const testId = useId({ prefix: 'test', namespace: inputId })

// Ref
const tempValue = ref('')
const actualMinWidth = ref(0)

// Computed
const autoWidthOptions = computed(() => ({
  maxWidth: '100%',
  minWidth: `${parseInt(actualMinWidth.value) + parseInt(props.comfortZone) + 2}px`, // "+ 2" is a magical number added by vue-input-autowidth
  comfortZone: parseInt(props.comfortZone)
}))

// Method
const focus = () => {
  document.activeElement?.blur ()
}

const blur = () => {
  document.activeElement?.blur ()
}

const onEsc = (e) => {
  e.stopImmediatePropagation ()
  emit('esc')
}

const placeholderWidth = async () => {
  if (!document.activeElement) return

  const test = document.getElementById(testId) || document.createElement('span')
  const style = window.getComputedStyle(document.activeElement)

  ;([
    'fontFamily',
    'fontKerning',
    'fontOpticalSizing',
    'fontSize',
    'fontStretch',
    'fontStyle',
    'fontVariant',
    'fontVariantLigatures',
    'fontVariantCaps',
    'fontVariantNumeric',
    'fontVariantEast-asian',
    'fontWeight',
    'letterSpacing',
    'padding',
    'textIndent',
    'textTransform',
    'whiteSpace',
    'wordBreak',
    'wordSpacing'
  ]).forEach(prop => {
    test.style[prop] = style[prop]
  })

  test.style.position = 'absolute'
  test.style.left = '-9000px'
  test.innerText = props.placeholder
  test.id = testId
  document.body.appendChild(test)

  await nextTick ()
  const width = test.offsetWidth
  return parseInt(width) || DEFAULT_MIN_WIDTH
}

// Watcher
watch(() => props.modelValue, (val) => {
  tempValue.value = val
  emit('update:modelValue', val)
})

watch(() => props.placeholder, async () => {
  actualMinWidth.value = props.minWidth || await placeholderWidth ()
})

// Lifecycle
onMounted(async () => {
  tempValue.value = props.modelValue
  actualMinWidth.value = props.minWidth || await placeholderWidth ()
})

onBeforeUnmount(() => {
  const test = document.getElementById(testId)
  if (test) test.parentNode.removeChild(test)
})

// Expose method
defineExpose({
  focus,
  blur
})
</script>
