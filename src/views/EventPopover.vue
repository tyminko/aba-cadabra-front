<template>
  <popover-modal-post :bookmark="bookmark">
      <event-view/>
  </popover-modal-post>
</template>

<script>
import PopoverModalPost from './components/UI/PopoverModalPost'
import EventView from './EventView'
import { getBookmark } from '../lib/bookmarks'

export default {
  name: 'PostPopover',
  components: { PopoverModalPost, EventView },
  data: () => ({
    bookmark: null
  }),
  beforeRouteEnter (to, from, next) {
    next(c => {
      const bookmark = getBookmark()
      if (bookmark.path !== to.fullPath) {
        c.bookmark = getBookmark()
      }
    })
  }
}
</script>
