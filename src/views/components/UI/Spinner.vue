<template>
  <transition><div v-if="show" class="spinner" /></transition>
</template>

<script>
export default {
  name: 'Spinner',
  props: { show: Boolean }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .spinner {
    @apply block relative;

    &.centered {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
    }

    &:before {
      content: '';
      @apply absolute box-border top-0 left-0 w-full h-full rounded-1/2 border-1/2base;
      border-color: white blue;
      top: 50%;
      left: 50%;
      animation: spinner 1.1s infinite linear;
      transition: opacity .1s;
    }

    &.small:before {
      @apply border-1/2base;
    }

    @keyframes spinner {
      0% { transform: translate(-50%,-50%) rotate(0deg);}
      100% {transform: translate(-50%,-50%) rotate(360deg);}
    }
  }
</style>
