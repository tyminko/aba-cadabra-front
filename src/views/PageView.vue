<template>
  <content-with-sidebar class="page-view">
    <template v-slot:main>
      <edit-button-badge
        :allow-edit="allowEdit"
        :post-status="postStatus"
        class="text-block absolute top-0 right-0"
        @open-editor="openEditor" />
      <div class="text-block relative">
        <h1 class="relative text-5xl mt-sm">{{title}}</h1>
      </div>
      <div v-for="item in attachments" :key="item.id" class="attachment mt-base mb-sm">
        <div class="attachment-box relative">
          <img
            :src="item.url"
            :alt="item.caption"
            :width="(item.dimensions || {}).w"
            :height="(item.dimensions || {}).h"
            class="bg-gray-400"/>
          <div v-if="item.caption" class="text-block text-sm">
            {{item.caption}}
          </div>
        </div>
      </div>
      <div class="text-block mt-base" v-html="content" />
      <template v-if="template">
        <component :is="template" />
      </template>
    </template>
    <template v-slot:sidebar>
      <component :is="templateSidebar" :post="postData"/>
    </template>
  </content-with-sidebar>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { db } from '../lib/firebase'
import PostData from '../mixins/post-data'
import ContentWithSidebar from './components/UI/layouts/ContentWithSidebar'
import EditButtonBadge from './components/EditButtonBadge'
import PageSidebar from './PageSidebar'
import Residency from './components/page-templates/Residency'
import About from './components/page-templates/About'
import AboutSidebar from './components/page-templates/AboutSidebar'

export default {
  name: 'PageView',
  components: { PageSidebar, EditButtonBadge, ContentWithSidebar, Residency, About, AboutSidebar },
  mixins: [PostData],
  props: {},

  data: () => ({
    postData: {},
    collectionRef: db.collection('pages')
  }),

  computed: {
    ...mapState(['user']),
    allowEdit () { return !!this.user && (this.user.role === 'admin' || this.user.role === 'editor') },
    template () {
      const t = this.postData.template
      const components = ['Residency', 'About']
      return components.includes(t) ? t : null
    },
    templateSidebar () {
      switch (this.template) {
        case 'About': return 'AboutSidebar'
        default: return 'PageSidebar'
      }
    }
  },

  created () {},

  methods: {
    ...mapActions(['showEditor']),
    openEditor () {
      if (this.postData) {
        this.showEditor({
          value: this.postData,
          type: 'page'
        })
      }
    }
  }
}
</script>

<style lang="scss">
  .page-view {
  }
</style>
