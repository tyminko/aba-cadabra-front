<template>
  <header class="main-header">
    <slot></slot>
  </header>
</template>

<script setup lang="ts">
// Component setup
</script>

<style scoped>
.main-header {
  width: 100%;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
