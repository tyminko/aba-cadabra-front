<template>
  <div class="user-things flex items-center">
    <a
      v-if="viewCanToggleDrafts"
      @click.prevent="toggleDraftsInGrid"
      class="ml-auto nav-item select-none text-xs cursor-pointer">
      <span>{{messageToggleDrafts}}</span>
    </a>
    <sliding-panel v-if="user" ref="menu" class="user-menu">
      <template v-slot:trigger="{on, open}">
        <button class="user-menu-button mr-0" @click="on">
          <i class="material-icons dimmed">add</i>
        </button>
      </template>
      <div class="user-actions-wrapper">
        <ul class="user-actions">
          <li v-if="contributor" class="menu-cell nav-item cursor-pointer">
            <a @click.prevent="openEditor('post')">Add Blog Post</a>
          </li>
          <li v-if="adminOrEditor" class="menu-cell nav-item cursor-pointer">
            <a @click.prevent="openEditor('event')">Add Event</a>
          </li>
          <li v-if="admin" class="menu-cell nav-item cursor-pointer">
            <a @click.prevent="openEditor('profile')">Add User</a>
          </li>
        </ul>
      </div>
    </sliding-panel>
    <sliding-panel ref="user-menu" class="user-menu">
      <template v-slot:trigger="{on, open}">
        <button class="user-menu-button" @click="on">
          <i v-if="user" class="material-icons dimmed" :class="{open, user}">{{open ? 'sentiment_very_satisfied' : 'sentiment_satisfied'}}</i>
          <i v-else class="material-icons dimmed" :class="{open}">chevron_right</i>
        </button>
      </template>
      <div class="user-actions-wrapper">
        <login-form v-if="!user" />
        <div v-else class="user-actions">
<!--          <div class="menu-cell">-->
            <a @click.prevent="openMyProfileEditor" class="menu-cell block cursor-pointer">
              <span class="block">{{user.displayName}}</span>
              <span class="block">Profile</span>
            </a>
<!--          </div>-->
          <router-link v-if="admin" :to="{name: 'users'}" class="menu-cell nav-item">
            Users
          </router-link>
<!--          <router-link v-if="admin" :to="{name: 'wp-users'}" class="menu-cell nav-item">-->
<!--            Import WP Users-->
<!--          </router-link>-->
<!--          <router-link v-if="admin" :to="{name: 'wp-posts'}" class="menu-cell nav-item">-->
<!--            Import WP Posts-->
<!--          </router-link>-->
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

<script>
import { mapState, mapActions } from 'vuex'
import SlidingPanel from './UI/SlidingPanel'
import LoginForm from './login/LoginForm'

export default {
  name: 'UserMenu',
  components: { SlidingPanel, LoginForm },

  data: () => ({
  }),

  computed: {
    ...mapState(['user', 'viewCanToggleDrafts', 'showDraftsInGrid']),
    admin () {
      return this.user && this.user.role === 'admin'
    },
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    contributor () {
      return this.user && (this.user.role === 'contributor' || this.adminOrEditor)
    },
    messageToggleDrafts () {
      return this.showDraftsInGrid ? 'Hide Drafts' : `Show ${!this.adminOrEditor ? 'Mine ' : ''}Drafts`
    }
  },

  watch: {
    user () {
      this.$nextTick(() => { if (this.$refs.menu) this.$refs.menu.jumpTop() })
      this.$nextTick(() => { if (this.$refs['user-menu']) this.$refs['user-menu'].jumpTop() })
    }
  },

  methods: {
    ...mapActions(['logOut', 'showEditor', 'updateUser', 'toggleDraftsInGrid']),
    openEditor (type, value) {
      this.showEditor({ type, value })
    },
    openMyProfileEditor () {
      this.showEditor({
        type: 'profile',
        value: this.user,
        onSaved: ({ data }) => {
          if (!data.displayName) return
          this.updateUser({ ...this.user, displayName: data.displayName })
        }
      })
    }
  }
}
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
