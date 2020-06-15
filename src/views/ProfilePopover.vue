<template>
  <popover-modal-post :bookmark="bookmark">
    <profile-view/>
  </popover-modal-post>
</template>

<script>
import PopoverModalPost from './components/UI/PopoverModalPost'
import ProfileView from './ProfileView'

export default {
  name: 'ProfilePopover',
  components: { ProfileView, PopoverModalPost }
}
</script>
