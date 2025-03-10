<template>
  <div class="editor">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'EditorPage'
})
// Component setup
</script>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: #fff;
}
</style>
