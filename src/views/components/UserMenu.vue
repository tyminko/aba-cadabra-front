<template>
  <sliding-panel class="user-menu">
    <template v-slot:trigger="{on, open}">
      <div class="user-menu-button" @click="on">
        <i v-if="user" class="material-icons dimmed" :class="{open, user}">{{open ? 'sentiment_very_satisfied' : 'sentiment_satisfied'}}</i>
        <i v-else class="material-icons dimmed" :class="{open}">chevron_right</i>
      </div>
    </template>
    <div class="user-actions-wrapper">
      <login-form v-if="!user" />
      <div v-else class="user-actions">
        <div>
          <router-link :to="{ name: 'profile' }">
            <div> {{user.displayName}} </div>
            Profile
          </router-link>
        </div>
        <router-link v-if="admin" :to="{name: 'users'}" class="nav-item">
          Users
        </router-link>
        <router-link v-if="admin" :to="{name: 'wp-users'}" class="nav-item">
          WP Users
        </router-link>
        <router-link v-if="admin" :to="{name: 'wp-posts'}" class="nav-item">
          WP Posts
        </router-link>
        <router-link v-if="admin" :to="{name: 'wp-attachments'}" class="nav-item">
          WP Attachmnts
        </router-link>
        <button class="login" @click="logOut">
          <span>Log Out</span>
        </button>
      </div>
    </div>
  </sliding-panel>
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
    ...mapState(['user']),
    admin () {
      return this.user && this.user.role === 'admin'
    }
  },

  methods: {
    ...mapActions(['logOut'])
  }
}
</script>

<style lang='scss'>
  @import '../../styles/vars';
  .user-menu {
    * {
     box-sizing: border-box;
    }
    .user-menu-button {
      width: $base-size;
      height: $base-size;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        transition: transform 0.15s;
        &.open {
          color: #000;
          &:not(.user) {
            transform: rotate(90deg);
          }
        }
      }
    }
    .user-actions-wrapper {
      padding-top: calc(#{$base-size} - 5px);
      border: 5px solid $color-prime;
      background: $color-bg;

      .user-actions {
        padding-top: 0;

        & > div, & > button {
          min-height: $base-size;
          display: flex;
          flex-flow: column;
          justify-content: center;
        }

        a {
          display: block;
          text-decoration: none;
        }
      }
    }
  }
</style>
