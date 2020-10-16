<template>
  <div class="main-header">
    <div ref="logo-box" class="logo-wrap">
      <router-link :to="{name: 'home'}" class="nav-item">
        <a-b-a-logo class="main block" />
      </router-link>
    </div>
    <nav>
      <router-link
        v-if="aboutPageRouterTo"
        :to="aboutPageRouterTo"
        class="nav-item flex justify-center">
        About
      </router-link>
      <template v-if="showPostFilters">
      </template>
      <user-menu class="user-menu" />
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import UserMenu from './UserMenu'
import ABALogo from './ABALogo'

export default {
  name: 'MainHeader',
  components: { ABALogo, UserMenu },
  data: () => ({}),

  computed: {
    ...mapState(['user', 'showDraftsInGrid', 'menu']),
    ...mapGetters(['pageRouteByTitle']),
    adminOrEditor () {
      return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    admin () {
      return this.user && this.user.role === 'admin'
    },
    showPostFilters () {
      return !!this.user
    },
    showDraftsMessage () {
      return this.showDraftsInGrid ? 'Hide Drafts' : `Show ${!this.adminOrEditor ? 'Mine ' : ''}Drafts`
    },

    aboutPageRouterTo () {
      return this.pageRouteByTitle('about')
    }
  },

  created () {
    window.addEventListener('scroll', this.setLogoSize)
  },

  methods: {
    ...mapActions(['logOut', 'toggleDraftsInGrid']),
    setLogoSize () {
      if (!this.$refs['logo-box']) return
      if (window.scrollY > 48) {
        this.$refs['logo-box'].classList.add('small')
      } else {
        this.$refs['logo-box'].classList.remove('small')
      }
    }
  }
}
</script>

<style lang='scss'>
  @import "../../styles/vars";

  #app {
    .main-header{
      // height: $base-size;

      display: flex;
      align-items: flex-end;
      padding: 0;
      z-index: $z-index-header;
      pointer-events: none;

      .logo-wrap {
        align-self: stretch;
        background: radial-gradient(closest-side, #4b4b4b, $color-bg-semitransparent);
        border: solid $color-aba-blue;
        border-width: 0 1px;
        padding: 0 1rem 0 0.6rem;
        margin: 0.5rem 0;
        pointer-events: all;
        transition: background 0.2s;
        a {
          text-decoration: none;
        }
        .a-b-a-logo.main.text-2xl {
          display: flex;
          justify-content: center;
          $f-size: 6rem;
          font-size: $f-size;
          line-height: 0.7;
          margin: $small-padding 0 calc(0.19428em - 0.5rem);
          color: $color-aba-blue;
          transition: font-size 0.2s;
        }
        &.small {
          height: 2.25rem;
          margin: 0;
          align-self: center;
          background: radial-gradient(closest-side, #fff, $color-bg-semitransparent);

          .a-b-a-logo.main.text-2xl {
            @apply text-2xl;
          }
        }
      }
      nav {
        display: flex;
        align-items: center;
        width: 100%;
        pointer-events: all;

        a {
          &.nav-item {
            display: flex;
            align-items: center;
            height: $base-size * 0.75;
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
      //background: $color-bg;
    }
  }
</style>
