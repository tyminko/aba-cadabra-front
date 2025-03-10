<template>
  <div
    class="users min-h-screen p-base"
    :aria-busy="isLoading">
    <header class="mb-lg">
      <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
      <p class="mt-2 text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
    </header>

    <div
      v-if="isLoading"
      class="loading-state flex items-center justify-center py-lg"
      role="status">
      <span class="sr-only">Loading users...</span>
      <div class="spinner"></div>
    </div>

    <div
      v-else-if ="users.length === 0"
      class="empty-state text-center py-lg text-gray-500"
      role="status">
      No users found
    </div>

    <div
      v-else
      class="users-grid"
      role="grid"
      aria-label="Users list">
      <div
        v-for="user in sortedUsers"
        :key="user.uid"
        class="user-card"
        role="gridcell"
        tabindex="0"
        @click="openEditor(user)"
        @keydown.enter="openEditor(user)"
        @keydown.space.prevent="openEditor(user)">

        <div class="user-photo">
          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            :alt="`${user.displayName || user.email}'s photo`"
            class="h-16 w-16 rounded-full">
          <div
            v-else
            class="avatar-placeholder"
            :aria-label="`${user.displayName || user.email}'s placeholder avatar`">
            {{ getInitials(user.displayName || user.email) }}
          </div>
        </div>

        <div class="user-info">
          <h3
            class="name"
            :class="{'text-primary': user.position && user.position !== 'resident'}">
            {{ user.displayName || user.email }}
          </h3>

          <p class="email">{{ user.email }}</p>

          <div class="badges">
            <span
              v-if="user.position"
              class="position-badge"
              :class="user.position === 'resident' ? 'resident' : 'staff'">
              {{ user.position }}
            </span>

            <span
              class="role-badge"
              :class="[user.role]">
              {{ user.role }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { getAll } from '../../lib/users'
import { db } from '../../lib/firebase'

defineOptions({
  name: 'UsersPage'
})

interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role: 'admin' | 'editor' | 'visitor'
  position?: string
}

interface Profile {
  uid: string
  abaPosition?: string
  [key: string]: any
}

// Store
const store = useStore ()

// State
const users = ref<User[]>([])
const isLoading = ref(false)
const isSmallViewport = ref(false)

// Computed
const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    const nameA = a.displayName?.toLowerCase () || a.email.toLowerCase ()
    const nameB = b.displayName?.toLowerCase () || b.email.toLowerCase ()
    return nameA.localeCompare(nameB)
  })
})

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase ()
    .slice(0, 2)
}

const openEditor = (user: User) => {
  store.dispatch('showEditor', {
    type: 'profile',
    value: user,
    onSaved: ({ uid, data }: { uid: string, data: any }) => {
      if (!data.displayName) return

      const index = users.value.findIndex(u => u.uid === uid)
      if (index > -1) {
        users.value[index] = {
          ...user,
          displayName: data.displayName,
          email: data.email,
          role: data.role,
          position: data.abaPosition && data.abaPosition !== 'guest' ? data.abaPosition : ''
        }
      }
    }
  })
}

const checkViewportSize = () => {
  isSmallViewport.value = window.innerWidth < 600 || window.innerHeight < 400
}

const fetchUsers = async () => {
  const currentUser = store.state.user
  if (!currentUser || currentUser.role !== 'admin') {
    users.value = []
    return
  }

  isLoading.value = true

  try {
    // Fetch users
    const usersList = await getAll ()
    users.value = usersList

    // Fetch profiles
    const profilesSnapshot = await db.collection('profiles').get ()
    const profiles: Profile[] = profilesSnapshot.docs.map(doc => ({
      ...doc.data (),
      uid: doc.id
    }))

    // Update users with profile data
    profiles.forEach(profile => {
      if (profile.abaPosition && profile.abaPosition !== 'guest') {
        const index = users.value.findIndex(u => u.uid === profile.uid)
        if (index > -1) {
          users.value[index] = {
            ...users.value[index],
            position: profile.abaPosition
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchUsers ()
  checkViewportSize ()
  window.addEventListener('resize', checkViewportSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkViewportSize)
})
</script>

<style lang="scss" scoped>
.users {
  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
  }

  .user-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    cursor: pointer;

    &:hover, &:focus {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    &:focus {
      outline: 2px solid var(--primary-color, #4f46e5);
      outline-offset: 2px;
    }
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    background-color: var(--primary-color-light, #e0e7ff);
    color: var(--primary-color, #4f46e5);
    font-weight: 600;
    border-radius: 9999px;
  }

  .user-info {
    flex: 1;
    min-width: 0;

    .name {
      font-weight: 600;
      color: var(--text-color, #111827);
      margin-bottom: 0.25rem;

      &.text-primary {
        color: var(--primary-color, #4f46e5);
      }
    }

    .email {
      font-size: 0.875rem;
      color: var(--text-color-light, #6b7280);
      margin-bottom: 0.5rem;
    }
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .position-badge, .role-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .position-badge {
      &.resident {
        background-color: var(--primary-color-light, #e0e7ff);
        color: var(--primary-color, #4f46e5);
      }

      &.staff {
        background-color: var(--success-bg, #ecfdf5);
        color: var(--success-text, #065f46);
      }
    }

    .role-badge {
      &.admin {
        background-color: var(--primary-color, #4f46e5);
        color: white;
      }

      &.editor {
        background-color: var(--primary-color-light, #e0e7ff);
        color: var(--primary-color, #4f46e5);
      }

      &.visitor {
        background-color: var(--gray-100, #f3f4f6);
        color: var(--gray-600, #4b5563);
      }
    }
  }
}

.loading-state {
  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid var(--primary-color-light, #e0e7ff);
    border-top-color: var(--primary-color, #4f46e5);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
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
