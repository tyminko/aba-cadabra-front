<template>
  <div class="works">
    <div v-for="(work, id) in works" :key="id" class="work-card-wrapper">
      <div class="work-card" @click="openWork(id)">
        <div
          v-if="work.posterImage && work.posterImage.preview"
          class="image-box">
          <img :src="work.posterImage.preview.url">
        </div>
        <expandable-text-line class="work-title">
          {{ work.title }}
        </expandable-text-line>
        <button v-if="user" class="edit" @click="openWorkEditor(id)">
          Edit
        </button>
      </div>
    </div>
    <template v-if="user">
      <button class="add-work" @click="openWorkEditor">
        +
      </button>
      <popover-modal v-if="shouldOpenEditor" :open="shouldOpenEditor" @close="closeEditor">
        <work-editor ref="editor" :work="editableWork" @close="closeEditor" />
      </popover-modal>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { db } from '../lib/firebase'
import WorkEditor from './components/WorkEditor'
import PopoverModal from './components/UI/PopoverModal'
import ExpandableTextLine from 'vue-expandable-text-line'

export default {
  name: 'Works',
  components: { PopoverModal, WorkEditor, ExpandableTextLine },

  data: () => ({
    unsubscribe: null,
    works: {},
    editableWork: null,
    shouldOpenEditor: false,
    images: []
  }),

  computed: {
    ...mapState(['user']),
    orderedImages () {
      return this.images
    }
  },

  created () {
    this.getWorks()
  },

  beforeDestroy () {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },

  methods: {
    getWorks () {
      this.unsubscribe = db.collection('works').where('published', '==', true)
        .onSnapshot(
          querySnapshot => {
            querySnapshot.forEach(doc => {
              const work = doc.data()
              if (!work.posterImage && work.hasOwnProperty('attachments')) {
                work.posterImage = Object.values(work.attachments).sort((a, b) => a.order - b.order)[0]
              }
              this.$set(this.works, doc.id, work)
            })
          },
          err => {
            // eslint-disable-next-line no-console
            console.error('getFeed:', err)
          }
        )
    },

    openWork (id) {

    },

    openWorkEditor (id) {
      this.shouldOpenEditor = true
      this.editableWork = id ? { ...this.works[id], id } : null
    },

    closeEditor () {
      if (this.$refs.editor) {
        this.$refs.editor.close()
          .then(res => {
            if (res === 'close') {
              this.shouldOpenEditor = false
              this.editableWork = null
            }
          })
      } else {
        this.shouldOpenEditor = false
        this.editableWork = null
      }
    }
  }
}
</script>

<style lang='scss'>
  @import "../styles/vars";

  .works {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(256px, 1fr));
    grid-gap: $base-padding;
    padding: $base-padding;

    .work-card-wrapper {
      position: relative;
      height: 0;
      width: 100%;
      padding-top: 100%;

      .work-card {
        display: flex;
        position: absolute;
        top:0;
        left: 0;
        width: 100%;
        height: 100%;

        cursor: pointer;

        .work-title {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: $base-padding / 1.5;
          background: $color-white-semitransparent;
        }

        .image-box {
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        }

        button.edit {
          position: absolute;
          display: none;
          top: 1rem;
          right: 1rem;
        }

        &:hover {
          button.edit {
            display: block;
          }
        }
      }
    }
  }
</style>
