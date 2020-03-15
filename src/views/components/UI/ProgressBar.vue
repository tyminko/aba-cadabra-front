<template>
  <div class="progress-bar relative w-full h-1/2base flex items-center justify-center">
    <div v-if="isDefined" class="absolute h-full left-0 top-0 bg-aba-blue" :style="{width:`${progress}%`}"/>
    <slot>
      <span v-if="showPercentage || !isDefined" class="relative text-xs">{{text}}</span>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    value: { type: Number, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    showPercentage: Boolean
  },
  computed: {
    isDefined () {
      return typeof this.value !== 'undefined'
    },
    progress () {
      if (this.isDefined) {
        return Math.min(1, Math.max(0, (this.value - this.min) / (this.max - this.min))) * 100
      }
      return undefined
    },
    text () {
      return this.isDefined ? `${Math.ceil(this.progress)}%` : 'Processing...'
    }
  }
}
</script>
