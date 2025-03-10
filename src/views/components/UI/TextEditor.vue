<template>
  <div
    class="text-editor"
    :class="{ 'text-editor--focused': isFocused }"
    role="textbox"
    :aria-label="label"
    :aria-multiline="true"
    :aria-readonly="readonly">
    <div class="text-editor__toolbar" role="toolbar" aria-label="Text editor toolbar">
      <button
        v-for="(action, index) in availableActions"
        :key="index"
        class="text-editor__tool-btn"
        :class="{ 'text-editor__tool-btn--active': isActionActive(action) }"
        :aria-label="action.label"
        :title="action.label"
        @click="executeAction(action)">
        <i class="material-icons">{{ action.icon }}</i>
      </button>
    </div>
    <div
      ref="editorRef"
      class="text-editor__content"
      :contenteditable="!readonly"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown.enter.prevent="handleEnter"
      @paste.prevent="handlePaste"
      v-html="modelValue" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import inputAutoWidth from 'vue-input-autowidth'
import ClickOutside from 'vue-click-outside'

const props = defineProp({
  modelValue: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  label: { type: String, default: 'Text editor' },
  placeholder: { type: String, default: 'Start typing...' },
  actions: {
    type: Array,
    default: () => [
      { label: 'Bold', icon: 'format_bold', command: 'bold' },
      { label: 'Italic', icon: 'format_italic', command: 'italic' },
      { label: 'Underline', icon: 'format_underlined', command: 'underline' },
      { label: 'Bullet List', icon: 'format_list_bulleted', command: 'insertUnorderedList' }
    ]
  }
})

const emit = defineEmit(['update:modelValue', 'focus', 'blur'])

const editorRef = ref(null)
const isFocused = ref(false)

const availableActions = computed(() => props.actions)

const isActionActive = (action) => {
  return document.queryCommandState(action.command)
}

const executeAction = (action) => {
  document.execCommand(action.command, false, action.value)
  editorRef.value?.focu ()
}

const handleInput = () => {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

const handleEnter = (e) => {
  e.preventDefault ()
  document.execCommand('insertLineBreak')
}

const handlePaste = (e) => {
  e.preventDefault ()
  const text = e.clipboardData?.getData('text/plain') ?? ''
  document.execCommand('insertText', false, text)
}

onMounted(() => {
  if (editorRef.value && !props.modelValue && props.placeholder) {
    editorRef.value.dataset.placeholder = props.placeholder
  }
})
</script>

<style lang="scss" scoped>
.text-editor {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--editor-radius, 0.375rem);
  overflow: hidden;

  &--focused {
    border-color: var(--color-aba-blue, #4f46e5);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  }

  &__toolbar {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
    background-color: var(--color-bg-secondary, #f9fafb);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  &__tool-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.25rem;
    color: var(--color-text-secondary, #6b7280);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-bg-hover, #f3f4f6);
      color: var(--color-aba-blue, #4f46e5);
    }

    &--active {
      background-color: var(--color-bg-active, #eff6ff);
      color: var(--color-aba-blue, #4f46e5);
    }

    i {
      font-size: 1.25rem;
    }
  }

  &__content {
    min-height: 6rem;
    padding: 0.75rem;
    outline: none;
    line-height: 1.5;

    &:empty::before {
      content: attr(data-placeholder);
      color: var(--color-text-placeholder, #9ca3af);
    }

    &[contenteditable=false] {
      background-color: var(--color-bg-disabled, #f3f4f6);
      cursor: not-allowed;
    }
  }
}
</style>
