<template>
  <div class="transfer-wp-attachments">
    <div>
      <button :loading="processing" @click="process">
        Transfer Attachments
      </button>
      <!-- <v-btn :ripple="false" color="red" :disabled="true" :loading="processing" @click="deleteUsers">
        Delete All
      </v-btn> -->
    </div>
    <div class="attachments">
      <div
        v-for="item in wpAttachments"
        :key="item.post.ID"
        class="item">
        <img
          v-if="item.post.post_mime_type.startsWith('image/')"
          :src="thumbnailUrl(item)">
      </div>
    </div>
    <div>
      <template>
<!--        <strong>{{ Math.ceil(value) }}%</strong>-->
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import WP from '../../ABA-Data.json'

export default {
  name: 'TransferWPAttachments',
  components: {
  },

  data: () => ({
    transfered: [],
    processing: false
  }),

  computed: {
    ...mapState(['user']),
    wpAttachments () {
      if (!this.user || this.user.role !== 'admin') return []
      return WP.attachment
    },

    // activeAttachmnets () {
    //   return this.wpAttachmnets.map(item => {
    //     if (this.attachmentIsUsed(item)) {
    //       return item.post.ID
    //     }
    //   })
    // },

    done () {
      return this.transfered.length / this.wpAttachments.length * 100
    }
  },

  methods: {
    process () {},

    thumbnailUrl (item) {
      const thumbFile = item.meta._wp_attachment_metadata
        ? (item.meta._wp_attachment_metadata.sizes
          ? (item.meta._wp_attachment_metadata.sizes.thumbnail
            ? item.meta._wp_attachment_metadata.sizes.thumbnail.file
            : null)
          : null)
        : null
      if (!thumbFile) return item.post.url
      const base = item.post.url.split('/')
      base.pop()
      return base.join('/') + '/' + item.meta._wp_attachment_metadata.sizes.thumbnail.file
    },

    attachmentIsUsed (item) {
      if (item.post.post_parent) {}
    }
  }
}
</script>

<style lang='scss'>
  .transfer-wp-attachments{
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    height: calc(100vh - 76px);

    & > * {
      flex-shrink: 0;
    }
    .attachments {
      flex-shrink: 1;
      flex-grow: 1;
      overflow: auto;
      margin: 20px 0;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      grid-template-rows: auto;
      gap: 5px;
      width: 100%;

      .item {
        background: #ccc;
        height: 100px;

        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
</style>
