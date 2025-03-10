<template>
  <div
    class="login"
    :aria-busy="isNavigating">
    <router-view v-slot="{ Component }">
      <transition
        name="fade"
        mode="out-in"
        @before-leave="isNavigating = true"
        @after-enter="isNavigating = false">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { localData } from '../lib/local-storage'

defineOptions({
  name: 'LoginPage'
})

// Router and Store
const router = useRouter()
const store = useStore()

// State
const isNavigating = ref(false)

// Watch for user authentication state
watch(() => store.state.user, (user) => {
  if (user) {
    const lastRoute = localData.get('last-visited-route')
    const currentRouteName = router.currentRoute.value.name

    if (lastRoute?.name !== currentRouteName) {
      router.push(lastRoute || { name: 'home' })
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--bg-color, #f3f4f6);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
