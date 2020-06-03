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

<style lang="scss">
  .a-b-a-logo {
    & > span {
      display: inline-block;
      text-align: center;
      transition: transform 0.2s;

      &.a1{
        transform: rotate(-15deg) translateY(-2%);
      }
      &.a2{
        transform: rotate(-5deg) translateY(2%);
      }
    }
    &:hover {
      .a1{ transform: rotate(5deg) translateY(-5%); }
      .a2{ transform: rotate(15deg) translateY(5%); }
      .b { font-weight: 600 }
    }
    &:active {
      color: black;
      .a1{ transform: rotate(10deg) translateY(-15%) translateX(-15%); }
      .a2{ transform: rotate(18deg) translateY(20%) translateX(5%); }
      .b { font-weight: 600; font-size: 110% }
    }
  }
</style>
