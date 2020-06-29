<template>
  <popover-modal-post>
      <event-view/>
  </popover-modal-post>
</template>

<script>
import PopoverModalPost from './components/UI/PopoverModalPost'
import EventView from './EventView'

export default {
  name: 'EventPopover',
  components: { PopoverModalPost, EventView }
}
</script>
