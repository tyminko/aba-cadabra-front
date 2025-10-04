<template>
  <span class="b-f-s-c-a-logo text-2xl">
    <span class="b">B</span>
    <span class="f">F</span>
    <span class="s">S</span>
    <span class="c">C</span>
    <span class="a">A</span>
  </span>
</template>

<script>
export default { name: 'BFSLogo' }
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  @mixin transform-centered ($x-shift:0, $y-shift:0, $rotation:0) {
    transform: translate(-50% + $x-shift, -50% + $y-shift) rotate($rotation);
  }
  .b-f-s-c-a-logo {
    position: relative;
    white-space: nowrap;
    user-select: none;
    min-height: $base-size * 0.75;
    min-width: $base-size * 0.75 * 2.5; // Wider for 5 letters
    color: $color-aba-blue;

    & > span {
      display: block;
      position: absolute;
      text-align: center;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -55%);
      transition: transform 0.2s, font-weight 0.2s;
      font-weight: 400;

      &.b {
        @include transform-centered(-120%, -8%, -15deg);
      }
      &.f {
        @include transform-centered(-60%, 5%, 8deg);
      }
      &.s {
        @include transform-centered(0%, -3%, 0deg);
        font-weight: 500; // Slightly bolder for center letter
      }
      &.c {
        @include transform-centered(60%, 4%, -6deg);
      }
      &.a {
        @include transform-centered(120%, -6%, 12deg);
      }
    }

    &:hover {
      .b { @include transform-centered(-120%, -12%, -20deg); }
      .f { @include transform-centered(-60%, 8%, 12deg); }
      .s {
        @include transform-centered(0%, -5%, 0deg);
        font-weight: 600;
      }
      .c { @include transform-centered(60%, 6%, -10deg); }
      .a { @include transform-centered(120%, -10%, 18deg); }
    }

    &:active {
      color: $color-aba-red;
      font-size: 110%;
      .b { @include transform-centered(-120%, -15%, -25deg); }
      .f { @include transform-centered(-60%, 10%, 15deg); }
      .s {
        @include transform-centered(0%, -8%, 0deg);
        font-weight: 700;
        font-size: 115%;
      }
      .c { @include transform-centered(60%, 8%, -15deg); }
      .a { @include transform-centered(120%, -12%, 25deg); }
    }
  }

  // Main header variant
  #app .b-f-s-c-a-logo.main.text-2xl {
    line-height: 0.7;
    color: $color-aba-blue;
  }

  // Smaller variant for navigation
  .b-f-s-c-a-logo.text-sm {
    min-height: $base-size * 0.4;
    min-width: $base-size * 0.4 * 2.5;

    & > span {
      font-size: 0.8em;
    }
  }
</style>
