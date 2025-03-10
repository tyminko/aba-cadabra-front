<template>
  <PopoverModalPost>
    <template #header>
      <a
        v-if="viewCanToggleDrafts"
        @click.prevent="toggleDrafts"
        class="ml-auto nav-item select-none text-xs hover:text-aba-blue transition-colors">
        <span>{{ messageToggleDrafts }}</span>
      </a>
    </template>
    <BlogFeed/>
  </PopoverModalPost>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import PopoverModalPost from './components/UI/PopoverModalPost.vue'
import BlogFeed from './BlogFeed.vue'

// Store
const store = useStore()

// Computed
const user = computed(() => store.state.user)
const viewCanToggleDrafts = computed(() => store.state.viewCanToggleDrafts)
const showDraftsInGrid = computed(() => store.state.showDraftsInGrid)

const adminOrEditor = computed(() => {
  return user.value && (user.value.role === 'admin' || user.value.role === 'editor')
})

const messageToggleDrafts = computed(() => {
  return showDraftsInGrid.value
    ? 'Hide Drafts'
    : `Show ${!adminOrEditor.value ? 'Mine ' : ''}Drafts`
})

// Methods
const toggleDrafts = () => {
  store.dispatch('toggleDraftsInGrid')
}
</script>

<style lang="scss" scoped>
.nav-item {
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}
</style>
