<template>
  <div class="institutions">
    <div class="grid">
      <div
        v-for="institute in posts"
        :key="institute.id"
        class="partner-box relative">
        <a :href="institute.url" target="_blank" class="logo-box p-sm">
          <img
            v-if="hasLogo(institute)"
            :src="logoUrl(institute)"
            class="h-base"
            alt="partner logo"/>
        </a>
        <div class="my-base">
          <a :href="institute.url" target="_blank" class="block text-sm leading-tight" >{{institute.title}}, {{institute.country}}</a>
        </div>
        <button
          v-if="adminOrEditor"
          class="edit-button absolute top-0 right-0 compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
          @click="openEditor(institute)">
          <i class="material-icons text-base cursor-pointer">edit</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import FeedSubscription from '../../../mixins/feed-subscription'

export default {
  name: 'PartnersPage',
  mixins: [FeedSubscription],
  props: {},

  data: () => ({
    postToEdit: null,
    collectionName: 'institutions',
    orderBy: { field: '' }
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },
    post () {
      return Object.value(this.feed).sort((a, b) => {
        if (a.title < b.title) return -1
        if (a.title > b.title) return 1
        return 0
      })
    }
  },

  methods: {
    ...mapAction(['showEditor']),
    openEditor(post) {
      this.showEditor({
        type: 'partner',
        value: post
      })
    },

    closeEditor () {
      this.postToEdit = null
    },

    hasLogo(post) {
      return post.logo || Object.value((post.attachments || {})).length
    },

    logoUrl(post) {
      let src = null
      if (post.logo) {
        src = post.logo.srcSet
      } else {
        src = (Object.value(post.attachments)[0] || {}).srcSet
      }
      if (!src) return ''
      const { full, preview, original } = src
      return post.cardSize
        ? (full || original || preview || {}).url
        : (preview || full || original || {}).url
    }
  }
}
</script>

<style lang="scss">
  .institutions {
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-auto-rows: 200px;
      grid-gap: 24px;
      grid-auto-flow: dense;
      padding: 24px;
    }

    .partner-box {
      display: flex;
      flex-direction: column;
      text-align: center;
      .logo-box {
        flex-shrink: 1;
        min-height: 0;
        img {
          display: block;
          width: 100%;
          height: 100%;
          object-position: center;
          object-fit: scale-down;
          filter: saturate(0);
        }
      }
      .edit-button {
        opacity: 0;
        transition: opacity 0.2s;
      }
      &:hover{
        .edit-button {opacity: 1;}
      }
    }
  }
</style>
