<template>
  <popover-modal-post>
    <template v-slot:header>
      <a v-if="viewCanToggleDrafts" @click.prevent="toggleDraftsInGrid" class="ml-auto nav-item select-none text-xs">
        <span>{{messageToggleDrafts}}</span>
      </a>
    </template>
    <blog-feed/>
  </popover-modal-post>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import PopoverModalPost from './components/UI/PopoverModalPost'
import BlogFeed from './BlogFeed'

export default {
  name: 'BlogPopover',
  components: { BlogFeed, PopoverModalPost },
  computed: {
    ...mapState(['user', 'viewCanToggleDrafts', 'showDraftsInGrid']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    messageToggleDrafts () {
      return this.showDraftsInGrid ? 'Hide Drafts' : `Show ${!this.adminOrEditor ? 'Mine ' : ''}Drafts`
    }
  },
  methods: {
    ...mapActions(['toggleDraftsInGrid'])
  }
}
</script>
