<template>
  <div
    class="content-with-sidebar"
    role="main">
    <div
      class="main-box"
      role="region"
      aria-label="Main content">
      <slot name="main" />
    </div>
    <aside
      class="sidebar-box"
      role="complementary"
      aria-label="Sidebar content">
      <slot name="sidebar"/>
    </aside>
  </div>
</template>

<script setup lang="ts">
// Component is purely presentational, no props or logic needed
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss" scoped>
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
    padding: var(--base-padding, 1rem) 0;
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
        padding: 0 var(--base-padding, 1rem);
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
          padding: 0 calc(var(--base-padding, 1rem) * 2);
          border-right: 1px solid var(--color-aba-blue, #4f46e5);
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
