<template>
  <div class="post-editor-palette">
    <section class="flex items-center pb-3 border-b border-aba-blue-semi">
      <span class="mr-4 whitespace-no-wrap">Size:</span>
      <span class="size-button" :class="{active:current==='horizontal'}">
        <i/><i/><i/>
        <i class="material-icons">arrow_back</i>
        <i/>
        <i class="material-icons">arrow_forward</i>
        <i/><i/><i/>
      </span>
      <span class="size-button">
        <i/><i class="material-icons">arrow_upward</i><i/>
        <i/><i/><i/>
        <i/><i class="material-icons">arrow_downward</i><i/>
      </span>
      <span class="size-button">
        <i/><i class="material-icons">arrow_upward</i><i/>
        <i class="material-icons">arrow_back</i><i/><i class="material-icons">arrow_forward</i>
        <i/><i class="material-icons">arrow_downward</i><i/>
      </span>
    </section>
    <section class="text-sm py-3 border-b border-aba-blue-semi">
      Edit
    </section>
    <section class="text-sm py-3 border-b border-aba-blue-semi">
      Hide
    </section>
    <section class="text-sm pt-3">
      Remove
    </section>
  </div>
</template>

<script>
export default {
  name: 'PostEditorPalette',
  props: {
    current: { type: String, validator: v => ['horizontal', 'vertical', 'big'].includes(v) }
  },

  data: () => ({}),

  computed: {},

  methods: {}
}
</script>

<style lang="scss">
  @import "../../styles/vars";
  @import "../../styles/mixins";

  .post-editor-palette {

    .size-button {
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
      &:active {
        i {
          color: $color-prime;
          font-weight: 600;
        }
      }
    };
  }
</style>
