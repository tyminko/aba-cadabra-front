<template>
  <popover-modal-post :bookmark="bookmark">
    <profile-view/>
  </popover-modal-post>
</template>

<script>
import PopoverModalPost from './components/UI/PopoverModalPost'
import { getBookmarkForPath } from '../lib/bookmarks'
import ProfileView from './ProfileView'

export default {
  name: 'ProfilePopover',
  components: { ProfileView, PopoverModalPost },
  data: () => ({
    bookmark: null
  }),
  computed: {},
  beforeRouteEnter (to, from, next) {
    next(thisComponent => {
      thisComponent.bookmark = getBookmarkForPath(to.fullPath)
    })
  }
}
</script>
