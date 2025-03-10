<template>
  <div class="admin-area">
    <router-view v-slot="{ Component }">
      <transition
        name="fade"
        mode="out-in"
        appear>
        <suspense>
          <template #default>
            <component :is="Component" />
          </template>
          <template #fallback>
            <div class="loading-state" role="status">
              <span class="sr-only">Loading...</span>
              <div class="spinner"></div>
            </div>
          </template>
        </suspense>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

// Store and Router
const store = useStore ()
const router = useRouter ()

// Check admin access
onMounted(() => {
  const user = store.state.user
  if (!user || user.role !== 'admin') {
    router.replace({ name: 'home' })
  }
})
</script>

<style lang="scss" scoped>
.admin-area {
  position: relative;
  min-height: 100vh;
  background-color: var(--admin-bg, #f9fafb);

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;

    .spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 3px solid var(--primary-color-light, #e0e7ff);
      border-top-color: var(--primary-color, #4f46e5);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
