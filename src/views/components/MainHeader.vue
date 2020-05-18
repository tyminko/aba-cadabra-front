<template>
  <div class="main-header">
    <nav>
      <router-link :to="{name: 'home'}" class="nav-item">
        <span>ABA</span>
      </router-link>
      <template v-if="showPostFilters">
        <router-link :to="{name: 'home-filtered', params: {filter: 'internal'}}" class="nav-item">
<!--          <span>Internal</span>-->
          <i class="material-icons">emoji_objects</i>
        </router-link>
        <router-link :to="{name: 'home-filtered', params: {filter: 'my'}}" class="nav-item">
<!--          <span>My Posts</span>-->
          <i class="material-icons">account_box</i>
        </router-link>
        <router-link :to="{name: 'home-filtered', params: {filter: 'draft'}}" class="nav-item">
<!--          <span>Drafts</span>-->
          <i class="material-icons">post_add</i>
        </router-link>
        <router-link :to="{name: 'home-filtered', params: {filter: 'trash'}}" class="nav-item">
<!--          <span>Trash</span>-->
          <i class="material-icons">delete_outline</i>
        </router-link>
      </template>
      <user-menu class="user-menu" />
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import UserMenu from './UserMenu'

export default {
  name: 'MainHeader',
  components: { UserMenu },
  data: () => ({}),

  computed: {
    ...mapState(['user']),
    admin () {
      return this.user && this.user.role === 'admin'
    },
    showPostFilters () {
      return !!this.user
    }
  },

  methods: {
    ...mapActions(['logOut'])
  }
}
</script>

<style lang='scss'>
  @import "../../styles/vars";

  .main-header{
    height: $base-size;

    display: flex;
    align-items: center;

    padding: 0;

    z-index: $z-index-header;

    pointer-events: none;

    nav {
      display: flex;
      align-items: center;
      width: 100%;
      pointer-events: all;

      a {
        &.nav-item {
          /*margin-right: $base-padding;*/
          display: flex;
          align-items: center;
          /*justify-content: center;*/
          background: $color-bg-semitransparent;
          padding: $base-padding /2 $base-padding;
        }
      }
    }

    .login {
      flex-shrink: 0;
      margin-left: auto;
      pointer-events: all;
    }

  }

  .user-actions {
    padding: $base-padding / 2;
    background: $color-bg;
  }
</style>
