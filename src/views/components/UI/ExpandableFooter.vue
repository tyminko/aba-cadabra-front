<template>
  <div class="expandable-footer">
    <expandable-text-line class="footer-content">
      <slot />
    </expandable-text-line>
    <div class="tools">
      <slot name="tools" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ExpandableTextLine from 'vue-expandable-text-line'

export default {
  name: 'ExpandableFooter',
  components: { ExpandableTextLine },
  props: {
    duration: { type: Number, default: 0.1 }
  },
  data: () => ({
    useHover: true,
    minHeight: 0
  }),
  computed: {
    ...mapState(['useTouch'])
  },

  methods: {
  }
}
</script>

<style lang='scss'>
  @import "../../../styles/vars";

  .expandable-footer {
    display: flex;
    align-items: flex-end;
    height: $base-size / 2;

    .tools {
      flex-shrink: 0;
      background: $color-semitransparent;
    }

    .footer-content {
      flex-grow: 1;
      padding: 10px;
      background: $color-semitransparent;
    }
  }
</style>
