<template>
  <sliding-panel ref="menu" class="user-menu">
    <template v-slot:trigger="{on, open}">
      <button class="user-menu-button" @click="on">
        <i v-if="user" class="material-icons dimmed" :class="{open, user}">{{open ? 'sentiment_very_satisfied' : 'sentiment_satisfied'}}</i>
        <i v-else class="material-icons dimmed" :class="{open}">chevron_right</i>
      </button>
    </template>
    <div class="user-actions-wrapper">
      <login-form v-if="!user" />
      <div v-else class="user-actions">
        <div class="menu-cell">
          <router-link :to="{ name: 'profile' }">
            <div> {{user.displayName}} </div>
            Profile
          </router-link>
        </div>
        <router-link v-if="admin" :to="{name: 'users'}" class="menu-cell nav-item">
          Users
        </router-link>
        <router-link v-if="admin" :to="{name: 'wp-users'}" class="menu-cell nav-item">
          WP Users
        </router-link>
        <router-link v-if="admin" :to="{name: 'wp-posts'}" class="menu-cell nav-item">
          WP Posts
        </router-link>
        <router-link v-if="admin" :to="{name: 'wp-attachments'}" class="menu-cell nav-item">
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

  watch: {
    user () {
      if (this.$refs.menu) this.$nextTick(() => this.$refs.menu.jumpTop())
    }
  },

  methods: {
    ...mapActions(['logOut'])
  }
}
</script>

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
      border: $border-thick-w solid $color-prime;
      @include wider-then-phone {
        width: auto;
        margin-right: $base-padding / 2;
      }
    }
    .user-actions-wrapper {
      padding-top: calc(#{$base-size} - #{$border-thick-w});
      background: $color-bg;
      overflow: hidden;

      .user-actions {
        padding-top: 0;

        .menu-cell {
          display: flex;
          align-items: center;
          min-height: $base-size;
          padding: $base-padding / 2 $base-padding;
          &:not(:last-child) {
            border-bottom: 1px #0000ff7e solid;
          }
        }
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
