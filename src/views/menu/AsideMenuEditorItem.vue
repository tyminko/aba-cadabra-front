<template>
  <div class="menu-item flex items-center text-lg h-base bg-white pr-base">
    <div
      class="handle flex items-center"
      :class="{'opacity-0': status==='draft'}">
      <i class="material-icons text-gray-300 cursor-move">drag_indicator</i>
    </div>
    <router-link
      :to="{name: item.type, params: {id: item.id}}"
      class="px-sm"
      :class="[status]">
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
    editable: Boolean,
    status: { type: String, default: 'public', validator: val => ['draft', 'internal', 'public'].includes(val) }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  .menu-item {
    a {
      text-transform: capitalize;
      &.draft {
        @apply text-gray-600 font-light italic;
      }
      &.internal {
        @apply bg-gray-100;
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
