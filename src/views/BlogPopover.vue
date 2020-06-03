<template>
  <popover-modal-post :bookmark="bookmark">
    <template v-slot:header>
      <a v-if="viewCanToggleDrafts" @click.prevent="toggleDraftsInGrid" class="ml-auto nav-item select-none text-xs">
        <span>{{messageToggleDrafts}}</span>
      </a>
    </template>
    <blog-feed/>
  </popover-modal-post>
</template>

<script>
import PopoverModalPost from './components/UI/PopoverModalPost'
import BlogFeed from './BlogFeed'
import { getBookmark } from '../lib/bookmarks'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'BlogPopover',
  components: { BlogFeed, PopoverModalPost },
  data: () => ({
    bookmark: null
  }),
  computed: {
    ...mapState(['user', 'viewCanToggleDrafts', 'showDraftsInGrid']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    messageToggleDrafts () {
      return this.showDraftsInGrid ? 'Hide Drafts' : `Show ${!this.adminOrEditor ? 'Mine ' : ''}Drafts`
    }
  },
  beforeRouteEnter (to, from, next) {
    next(c => {
      const bookmark = getBookmark()
      if (bookmark.path !== to.fullPath) {
        c.bookmark = getBookmark()
      }
    })
  },
  methods: {
    ...mapActions(['toggleDraftsInGrid'])
  }
}
</script>
