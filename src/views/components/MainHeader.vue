<template>
  <div ref="header" class="main-header">
    <div ref="logo-box" class="logo-wrap">
      <router-link :to="{name: 'home'}" class="nav-item logo-link">
        <a-b-a-logo ref="logo" class="main block" />
      </router-link>
    </div>
    <nav>
      <router-link
        v-if="aboutPageRouterTo"
        :to="aboutPageRouterTo"
        class="nav-item secondary-item flex justify-center">
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
  data: () => ({
    logoIsSmall: false
  }),

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
    window.addEventListener('resize', this.setLogoSize)
  },

  methods: {
    ...mapActions(['logOut', 'toggleDraftsInGrid']),
    setLogoSize () {
      if (!this.$refs['logo-box']) return
      const style = getComputedStyle(document.documentElement)
      const mainH = style.getPropertyValue('--logo-main-height')
      const rem = 16 // px
      const mainHpx = parseFloat(mainH) * rem
      if (window.scrollY > mainHpx / 4) {
        if (!this.logoIsSmall) {
          this.$refs['logo-box'].classList.add('small')
          this.logoIsSmall = true
        }
      } else {
        if (this.logoIsSmall) {
          this.$refs['logo-box'].classList.remove('small')
          this.logoIsSmall = false
        }
      }
      if (this.logoIsSmall) return
      requestAnimationFrame(() => {
        if (!this.$refs['logo-box'] || !this.$refs.logo) return
        const s = window.scrollY
        const curScale = style.getPropertyValue('--logo-current-scale')
        const startH = parseFloat(mainH) * rem
        const endH = 3 * rem
        const t = s / (startH - endH)
        let scale = 1
        if (t < 1) {
          const curH = startH * (1 - t) + endH * t
          scale = curH / startH
        } else {
          scale = endH / startH
        }
        if (curScale !== `${scale}`) {
          document.documentElement.style.setProperty('--logo-current-scale', `${scale}`)
        }
      })
    }
  }
}
</script>

<style lang='scss'>
  @import "../../styles/vars";
  @import "../../styles/mixins";
  :root {
    --logo-current-scale: 1;
    --logo-main-height: 4.5rem;
    @include wider-then( 310px ) {
      --logo-main-height: 5.6rem;
    }
    @include wider-then-phone {
      --logo-main-height: 8rem;
    }
  }
  #app {
    .main-header{
      display: flex;
      align-items: flex-end;
      padding: 0;
      z-index: $z-index-header;
      pointer-events: none;

      .logo-wrap {
        align-self: stretch;
        display: flex;
        align-items: center;
        height: calc(var(--logo-main-height) * var(--logo-current-scale));
        pointer-events: all;
        transition: background 0.2s, height 0.2s;
        a {
          text-decoration: none;
        }
        .logo-link {
          display: flex;
          height: calc(var(--logo-main-height) * var(--logo-current-scale) * 0.75);
          justify-content: center;
          background: radial-gradient(closest-side, #4b4b4b, $color-bg-semitransparent);
          border: solid $color-aba-blue;
          border-width: 0 1px;
          padding: 0 0.5rem;
          color: $color-aba-blue;

          transition: background 0.2s, height 0.2s;

          &:hover {
            background: radial-gradient(closest-side, #b9b9b9, $color-bg-semitransparent);
          }

          & > span {
            font-size: calc(var(--logo-main-height) * var(--logo-current-scale) * 0.75 * 0.95);
            height: calc(var(--logo-main-height) * var(--logo-current-scale) * 0.75);
            width: calc(var(--logo-main-height) * var(--logo-current-scale) * 0.75 * #{$logo-ratio});
            transition: font-size 0.2s, height 0.2s, width 0.2s;
          }
        }
        &.small {
          height: $base-size;
          .logo-link {
            height: calc(#{$base-size} * 0.75);
            background: radial-gradient(closest-side, #fff, $color-bg-semitransparent);
            & > span {
              font-size: 2rem;
              height: 100%;
              width: calc(#{$base-size} * 0.75 * #{$logo-ratio});
              transition: font-size 0.2s, height 0.2s, width 0.2s;
            }
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
        .nav-item.secondary-item {
          display: none;
          @include wider-then-phone {
            display: flex;
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
    }
  }
</style>
