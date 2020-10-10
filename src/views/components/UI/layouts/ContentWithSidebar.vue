<template>
  <div class="content-with-sidebar">
    <div class="main-box">
      <slot name="main" />
    </div>
    <div class="sidebar-box">
      <slot name="sidebar"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContentWithSidebar'
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../../../styles/vars";
  @import "../../../../styles/mixins";
  $sidebar-width: $max-width-sidebar;

  .content-with-sidebar {
    position: relative;
    display: block;
    /*flex-direction: column;*/
    /*justify-content: center;*/
    width: 100%;
    height: 100%;
    padding: $base-padding 0;
    overflow-y: auto;

    & > * {
      position: relative;
      //padding-top: $base-size;
    }
    .main-box {
      flex-shrink: 1;
      flex-grow: 1;
      min-width: 0;
      .text-block {
        padding: 0 $base-padding;
        max-width: 100%;
        hyphens: auto;
      }
    }
    .sidebar-box {
      @apply px-base;
    }
    @include wider-then($max-width-text-block + $sidebar-width / 2) {
      & {
        display: flex;
        flex-direction: row;
        .main-box {
          overflow-y: auto;
          //max-width: calc(#{$max-width-text-block} + #{$base-padding} * 2);
          padding: 0 $base-padding * 2;
        }
        .sidebar-box {
          overflow-y: auto;
          flex: 0 0 $sidebar-width;
          padding: $base-padding;
        }
      }
    }
    @include wider-then($max-width-text-block + $sidebar-width + $base-padding * 3) {
      .main-box .text-block {
        @apply px-0;
      }
    }
  }

</style>
