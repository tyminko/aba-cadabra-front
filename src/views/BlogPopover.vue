<template>
  <popover-modal-post>
      <blog-feed/>
  </popover-modal-post>
</template>

<script>
import PopoverModalPost from './components/UI/PopoverModalPost'
import BlogFeed from './BlogFeed'

export default {
  name: 'BlogPopover',
  components: { BlogFeed, PopoverModalPost }
}
</script>
