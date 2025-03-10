<template>
  <div class='create-users-from-wp'>
    <div>
      <button :disabled="processing" @click='process'>
        Create Users
      </button>
    </div>
    <div class='users'>
      <div
        v-for='item in wpUsers'
        :key='item.ID'
        class='item'>
        <div>{{ item.user_login }}</div>
        <div>{{ item.user_email }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import WP from '../../ABA-Data.json'

defineOptions({
  name: 'CreateUsersFromWpView'
})

interface WPUser {
  ID: number
  user_login: string
  user_email: string
  user_pass: string
  user_nicename: string
  user_url: string
  user_registered: string
  user_status: number
  display_name: string
}

const store = useStore()
const created = ref<number[]>([])
const processing = ref(false)

const wpUsers = computed<WPUser[]>(() => {
  if (!store.state.user || store.state.user.role !== 'admin') return []
  return WP.users
})

const done = computed(() => {
  return (created.value.length / wpUsers.value.length) * 100
})

watch(done, (value) => {
  if (value === 100) {
    processing.value = false
  }
})

const process = () => {
  // Implementation to be added
}
</script>

<style lang='scss'>
  .create-users-from-wp {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    height: calc(100vh - 76px);

    & > * {
      flex-shrink: 0;
    }
    .users {
      flex-shrink: 1;
      flex-grow: 1;
      overflow: auto;
      margin: 20px 0;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      grid-template-rows: auto;
      gap: 5px;
      width: 100%;

      .item {
        background: #ccc;
        padding: 10px;
      }
    }
  }
</style>
