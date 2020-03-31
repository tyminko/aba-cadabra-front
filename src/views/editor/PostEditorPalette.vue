<template>
  <div class="post-editor-palette">
    <section class="flex items-center pb-3 border-b border-aba-blue-semi">
      <span class="mr-4 whitespace-no-wrap">Size:</span>
      <span class="size-button" :class="{active:current==='horizontal'}" @click="setSize('horizontal')">
        <i/><i/><i/>
        <i class="material-icons">arrow_back</i>
        <i/>
        <i class="material-icons">arrow_forward</i>
        <i/><i/><i/>
      </span>
      <span class="size-button" :class="{active:current==='vertical'}" @click="setSize('vertical')">
        <i/><i class="material-icons">arrow_upward</i><i/>
        <i/><i/><i/>
        <i/><i class="material-icons">arrow_downward</i><i/>
      </span>
      <span class="size-button" :class="{active:current==='big'}" @click="setSize('big')">
        <i/><i class="material-icons">arrow_upward</i><i/>
        <i class="material-icons">arrow_back</i><i/><i class="material-icons">arrow_forward</i>
        <i/><i class="material-icons">arrow_downward</i><i/>
      </span>
    </section>
    <section class="text-sm py-3 border-b border-aba-blue-semi">
      <a class="block min-h-full cursor-pointer" @click.prevent="openEditor">Edit</a>
    </section>
    <section class="text-sm py-3 border-b border-aba-blue-semi">
      <a class="block min-h-full cursor-pointer" @click.prevent="hidePost">Hide</a>
    </section>
    <section class="text-sm pt-3">
      <a class="block min-h-full cursor-pointer" @click.prevent="removePost">Remove</a>
    </section>
  </div>
</template>

<script>
export default {
  name: 'PostEditorPalette',
  props: {
    current: { type: String, validator: v => ['horizontal', 'vertical', 'big', ''].includes(v) }
  },

  data: () => ({}),

  computed: {},

  methods: {
    openEditor () {
      this.$emit('close')
      this.$emit('open-editor')
    },
    setSize (size) {
      this.$emit('close')
      this.$emit('set-size', this.current === size ? '' : size)
    },
    removePost () {
      this.$emit('close')
      this.$emit('remove-post')
    },
    hidePost () {
      this.$emit('close')
      this.$emit('hide-post')
    }
  }
}
</script>

<style lang="scss">
  @import "../../styles/vars";
  @import "../../styles/mixins";

  .post-editor-palette {

    .size-button {
      position: relative;
      width: 30px;
      height: 30px;
      -webkit-appearance: none;
      @apply grid grid-cols-3 cursor-pointer;
      @include not-selectable;

      &:not(:last-child) {
        margin-right: $base-padding / 2;
      }

      i {
        width: 10px;
        height: 10px;
        &.material-icons {
          font-size: 10px;
          color: #000;
        }
      }
      &.active {
        i {
          color: $color-aba-blue;
          font-weight: 600;
        }
        &:before {
          content: '';
          display: block;
          position: absolute;
          width: 36px;
          height: 36px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: transparentize($color-dimmed, 0.9);
          z-index: -1;
        }
      }
      &:active {
        &:before { background: transparentize($color-dimmed, 0.3); }
      }
    };
  }
</style>
