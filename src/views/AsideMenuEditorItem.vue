<template>
  <div
    class="menu-item flex items-center text-lg h-base bg-white pr-base"
    :class="{'not-sortable': item.status!=='public'}">
    <div
      class="handle flex items-center"
      :class="{'opacity-0': item.status==='draft'}">
      <i class="material-icons text-gray-300 cursor-move">drag_indicator</i>
    </div>
    <router-link
      :to="{name: item.routeName, params: {id: item.id}}"
      class="px-sm"
      :class="[item.status]">
      {{item.title}}
    </router-link>
    <button
      v-if="editable"
      class="edit-button compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
      @click="$emit('open-editor')">
      <i class="material-icons text-base cursor-pointer">edit</i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'AsideMenuEditorItem',
  props: {
    item: { type: Object, required: true },
    editable: Boolean
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .menu-item {
    a {
      text-transform: capitalize;
      &.draft {
        @apply bg-aba-blue-semi text-white italic;
      }
      &.internal {
        @apply bg-gray-200;
      }
    }
    .handle:active {
      i { @apply text-aba-blue; }
    }
    .edit-button {
      opacity: 0;
      transition: opacity 0.1s;
      margin-left: auto;
    }
    &:hover {
      .edit-button { opacity: 1 }
    }
  }
  .popper-trigger {
    display: flex;
    width: min-content;
  }
</style>
