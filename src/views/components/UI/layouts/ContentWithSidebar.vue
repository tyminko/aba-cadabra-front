<template>
  <div class="content-with-sidebar">
    <div class="main-box">
      <slot name="main" />
    </div>
    <div class="sidebar-box">
      <slot name="sidebar" />
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
  $sidebar-width: 250px;

  .content-with-sidebar {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;

    & > * {
      position: relative;
      padding-top: $base-size;
    }
    .main-box {
      flex-shrink: 1;
      min-width: 0;
      .text-block {
        @apply px-base;
        max-width: 100%;
        hyphens: auto;
      }
    }
    .sidebar-box {
      @apply px-base;
    }
    @include wider-then($max-width-text-block-px + $sidebar-width / 2) {
      & {
        flex-direction: row;
        .main-box {
          max-width: calc(#{$max-width-text-block-px} + #{$base-padding-px} * 2);
        }
        .sidebar-box {
          flex: 0 0 $sidebar-width;
          padding: $base-size $base-padding;
        }
      }
    }
    @include wider-then($max-width-text-block-px + $sidebar-width + $base-padding-px * 3) {
      .main-box .text-block {
        @apply px-0;
      }
    }
  }

</style>
