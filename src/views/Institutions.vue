<template>
  <div class="institutions">
    <h1>Partners</h1>
    <div class="grid">
      <div
        v-for="institute in institutions"
        :key="institute.id"
        class="partner-box relative">
        <div class="logo-box p-sm">
          <img v-if="institute.logo" :src="logoUrl(institute)"/>
        </div>
        <div class="">
          <a class="block text-sm leading-tight" :href="institute.url">{{institute.title}}, {{institute.country}}</a>
        </div>
        <button
          v-if="adminOrEditor"
          class="absolute top-0 right-0 compact w-2/3base h-2/3base text-gray-600 hover:text-aba-blue"
          @click="openEditor(institute)">
          <i class="material-icons text-base cursor-pointer">edit</i>
        </button>
      </div>
    </div>
    <institution-editor
      v-if="!!postToEdit"
      :open="!!postToEdit"
      :value="postToEdit"
      @close="postToEdit=null"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Institutions from '../mixins/institutions'
import InstitutionEditor from './editor/InstitutionEditor'

export default {
  name: 'Institutions',
  components: { InstitutionEditor },
  mixins: [Institutions],
  props: {},

  data: () => ({
    postToEdit: null
  }),

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    }
  },

  methods: {
    openEditor (post) {
      this.postToEdit = post
    },

    closeEditor () {
      this.postToEdit = null
    },

    logoUrl (post) {
      let src = null
      if (post.logo) {
        src = post.logo.srcSet
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
    }
  }
</style>
