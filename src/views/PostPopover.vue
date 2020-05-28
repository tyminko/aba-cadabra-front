<template>
  <popover-modal-post
    ref="popover"
    :open="open"
    class=""
    @esc="$emit('esc')"
    @close="close">
<!--    <template v-slot:header>-->
<!--      <slot name="header">-->
<!--        <h1 class="capitalize px-sm text-aba-blue">{{type}}</h1>-->
<!--      </slot>-->
<!--    </template>-->
<!--    <div class="post-wrap">-->
      <component
        v-bind:is="component"
        ref="editor"
        :open="open"
        :value="value"
        @set-header="header = $event"
        @setProcessing="processing = $event"
        @close="$emit('close')"/>
<!--    </div>-->
  </popover-modal-post>
</template>

<script>
import PopoverModalPost from './components/UI/PopoverModalPost'
import EventView from './EventView'
import BlogFeed from './BlogFeed'

export default {
  name: 'PostPopover',
  components: { PopoverModalPost, EventView, BlogFeed },
  props: {
    open: Boolean,
    value: { type: Object, default: null },
    type: String
  },

  data: () => ({}),

  computed: {
    postType () {
      return this.type || (this.value || {}).type || 'post'
    },
    component () {
      switch (this.postType) {
        case 'event': return 'EventView'
        case 'post': return 'BlogFeed'
        default: return 'EventView'
      }
    }
  },

  methods: {
    close () {
      this.$emit('close')
      if (this.$refs.popover) {
        this.$refs.popover.releaseBgScroll()
      }
    }
  }
}
</script>

<!--suppress CssInvalidFunction -->
<style lang="css">
  .popover-modal.modal-post {
    /*width: calc(100vw - theme('padding.base') * 2);*/
  }
  .popover-modal.modal-post .post-wrap {
  }
</style>
