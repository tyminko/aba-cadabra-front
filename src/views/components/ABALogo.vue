<template>
  <span class="a-b-a-logo text-2xl">
    <span class="a1">A</span>
    <span class="b">B</span>
    <span class="a2">A</span>
  </span>
</template>

<script>
export default { name: 'ABALogo' }
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../styles/vars";
  @mixin transform-centered ($x-shift:0, $y-shift:0, $rotation:0) {
    transform: translate(-50% + $x-shift, -50% + $y-shift) rotate($rotation);
  }
  .a-b-a-logo {
    position: relative;
    white-space: nowrap;
    user-select: none;
    min-height: $base-size * 0.75;
    min-width: $base-size * 0.75 * $logo-ratio;
    & > span {
      display: block;
      position: absolute;
      text-align: center;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -55%);
      transition: transform 0.2s, font-weight 0.2s;

      &.a1{
        @include transform-centered(-95%, -5%, -12deg);
      }
      &.a2{
        @include transform-centered(95%, 3%, -5deg);
      }
    }
    &:hover {
      .a1{ @include transform-centered(-95%, -10%, -15deg); }
      .a2{ @include transform-centered( 95%, 8%, 15deg);}
      .b { font-weight: 600 }
    }
    &:active {
      color: black;
      font-size: 110%;
      .a1{ @include transform-centered(-95%, -15%, -20deg); }
      .a2{ @include transform-centered( 95%, 10%, 25deg);}
      .b { font-weight: 600; font-size: 110% }
    }
  }
  #app .a-b-a-logo.main.text-2xl {
    line-height: 0.7;
    // margin: $small-padding 0 0.19428em;
    color: $color-aba-blue;
  }
</style>
