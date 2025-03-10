<template>
  <div class="user-things flex items-center">
    <a
      v-if="viewCanToggleDrafts"
      @click.prevent="toggleDraftsInGrid"
      class="nav-item secondary-item ml-auto select-none text-xs leading-none cursor-pointer">
      <span>{{messageToggleDrafts}}</span>
    </a>
    <sliding-panel v-if="user" ref="menuRef" class="user-menu">
      <template #trigger="{on, open}">
        <button class="user-menu-button mr-0" @click="on">
          <i class="material-icons dimmed">add</i>
        </button>
      </template>
      <div class="user-actions-wrapper">
        <ul class="user-actions">
          <li v-if="contributor" class="menu-cell nav-item cursor-pointer">
            <a @click.prevent="() => openEditor('post')">Add Blog Post</a>
          </li>
          <li v-if="adminOrEditor" class="menu-cell nav-item cursor-pointer">
            <a @click.prevent="() => openEditor('event')">Add Event</a>
          </li>
          <li v-if="adminOrEditor" class="menu-cell nav-item cursor-pointer">
            <a @click.prevent="() => openEditor('partner')">Add Partner</a>
          </li>
          <li v-if="admin" class="menu-cell nav-item cursor-pointer">
            <a @click.prevent="() => openEditor('profile')">Add User</a>
          </li>
        </ul>
      </div>
    </sliding-panel>
    <sliding-panel ref="userMenuRef" class="user-menu">
      <template #trigger="{on, open}">
        <button class="user-menu-button" @click="on">
          <i v-if="user" class="material-icons dimmed" :class="{open, user}">{{open ? 'sentiment_very_satisfied' : 'sentiment_satisfied'}}</i>
          <i v-else class="material-icons dimmed" :class="{open}">chevron_right</i>
        </button>
      </template>
      <div class="user-actions-wrapper">
        <login-form v-if="!user" />
        <div v-else class="user-actions">
          <a @click.prevent="openMyProfileEditor" class="menu-cell block cursor-pointer">
            <span class="block">{{user.displayName}}</span>
            <span class="block">Profile</span>
          </a>
          <router-link v-if="admin" :to="{name: 'users'}" class="menu-cell nav-item">
            User
          </router-link>
          <router-link :to="{name: 'internal'}" class="menu-cell nav-item">
            <span>Internal Posts</span>
          </router-link>
          <router-link :to="{name: 'home-filtered', params: {filter: 'my'}}" class="menu-cell nav-item">
            <span>My Posts</span>
          </router-link>
          <router-link :to="{name: 'drafts'}" class="menu-cell nav-item">
            <span>Drafts</span>
          </router-link>
          <router-link :to="{name: 'trash'}" class="menu-cell nav-item">
            <span>Trash</span>
          </router-link>
          <a href="#" class="menu-cell nav-item justify-end" @click.prevent="logOut">
            <span class="whitespace-no-wrap">Log Out</span>
          </a>
        </div>
      </div>
    </sliding-panel>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import SlidingPanel from './UI/SlidingPanel'
import LoginForm from './login/LoginForm'

const store = useStore ()

// Ref
const menuRef = ref(null)
const userMenuRef = ref(null)

// Store state and action
const user = computed(() => store.state.user)
const viewCanToggleDrafts = computed(() => store.state.viewCanToggleDrafts)
const showDraftsInGrid = computed(() => store.state.showDraftsInGrid)

// Computed propertie
const admin = computed(() =>
  user.value && user.value.role === 'admin'
)

const adminOrEditor = computed(() =>
  user.value && (user.value.role === 'admin' || user.value.role === 'editor')
)

const contributor = computed(() =>
  user.value && (user.value.role === 'contributor' || adminOrEditor.value)
)

const messageToggleDrafts = computed(() =>
  showDraftsInGrid.value
    ? 'Hide Drafts'
    : `Show ${!adminOrEditor.value ? 'Mine ' : ''}Drafts`
)

// Method
const logOut = () => store.dispatch('logOut')
const toggleDraftsInGrid = () => store.dispatch('toggleDraftsInGrid')

const openEditor = (type, value) => {
  store.dispatch('showEditor', { type, value })
}

const openMyProfileEditor = () => {
  store.dispatch('showEditor', {
    type: 'profile',
    value: user.value,
    onSaved: ({ data }) => {
      if (!data.displayName) return
      store.dispatch('updateUser', { ...user.value, displayName: data.displayName })
    }
  })
}

// Watch
watch(user, () => {
  nextTick(() => {
    if (menuRef.value) menuRef.value.jumpTop ()
    if (userMenuRef.value) userMenuRef.value.jumpTop ()
  })
})
</script>

<!--suppress CssInvalidAtRule -->
<style lang='scss'>
  @import '../../styles/vars';
  @import '../../styles/mixins';
  .user-menu {
    margin-left: auto;
    * {
     box-sizing: border-box;
    }
    .user-menu-button {
      width: $base-size;
      height: $base-size;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: $base-padding / 2;

      i {
        transition: transform 0.15s;
        &.open {
          /*color: #000;*/
          &:not(.user) {
            transform: rotate(90deg);
          }
        }
      }
    }
    .sliding-panel {
      width: 100%;

      //border: $border-thick-w solid $color-aba-blue;
      @include wider-then-phone {
        width: auto;
        margin-right: $base-padding / 2;
      }
    }
    .user-actions-wrapper {
      padding-top: calc(#{$base-size} - #{$border-thick-w});
      /*background: rgba(32, 58, 214, 0.95);*/
      /*background: rgba(130, 130, 130, 0.95);*/
      background: rgba(70, 82, 130, 0.95);
      font-weight: 300;
      overflow: hidden;

      .user-actions {
        @apply px-sm;

        .menu-cell, button {
          display: flex;
          align-items: center;
          min-height: $base-size;
          padding: $base-padding / 2 $base-padding;
          color: #fff;
          background: transparent;
          min-width: 175px;

          &:not(:last-child) {
            border-bottom: 1px #d2d2d261 solid;
            /*border-bottom: 1px #0000ff7e solid;*/
          }
          & a {
            color: #fff;
          }
        }

        /*& > div, & > button {
          min-height: $base-size;
          display: flex;
          flex-flow: column;
          justify-content: center;
        }*/
        button {
          width: auto;
        }
        a {
          /*display: block;*/
          /*text-decoration: none;*/
          margin: 0;
        }
      }
    }
  }
</style>
