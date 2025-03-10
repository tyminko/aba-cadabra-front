<template>
  <div class="admin">
    <h1>Admin Panel</h1>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AdminPage'
})
</script>

<style scoped>
.admin {
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>
