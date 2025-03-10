<template>
  <div>
    <input
      ref='input'
      type='file'
      style='display:none'
      multiple
      accept='image/*, application/pdf'
      @change='addFilesFromOpenDialog'>
    <draggable
      ref='previews'
      v-model='attachments'
      v-bind='dragOptions'
      :move='onDragging'
      @start='dragging = true'
      @end='onEndDragging'>
      <transition-group
        ref='attachments-grid'
        type='transition'
        :name='!dragging ? "flip-list" : null'
        class='draggable attachments-grid'>
        <attachment-editor-cell
          v-for='(item, i) in attachments'
          v-model='attachments[i]'
          :key='item.id || i'
          :no-poster='maxNumber === 1'
          :no-caption='noCaption'
          :no-crop='noCrop'
          :is-poster='item.id === posterId'
          class='draggable-box bg-gray-200 cursor-move'
          @set-poster='setPoster'
          @remove='removeAttachment'/>
        <dropzone
          v-if='!maxNumber || attachments.length < maxNumber'
          :key='"n-a"'
          ref='new-attachment-cell'
          draggable='false'
          class='new-attachment-cell no-move flex flex-col items-center justify-center bg-gray-100'
          @drop='addFiles'>
          <p class='italic capitalize font-light text-gray-400'>{{dropzoneMessage}}</p>
          <div class='flex items-center'>
            <button class='flex-col h-auto leading-none' @click.prevent='openFileDialog'>
              <i class='material-icons'>attachment</i>
              <span class='text-sm text-center mt-1'>Attach File</span>
            </button>
            <button v-if='allowUrl' class='flex-col h-auto leading-none' @click.prevent='showUrlInput = true'>
              <i class='material-icons'>link</i>
              <span class='text-sm text-center mt-1'>Attach Url</span>
            </button>
          </div>
          <transition>
            <div
              v-if='showUrlInput'
              class='url-input absolute inset-0 flex items-center justify-center bg-white'>
              <div class='flex items-center justify-center w-full max-w-full'>
                <px-input v-model='urlToInsert' placeholder='Url' class='max-w-full'>
                  <template #add-on>
                    <div class='flex'>
                      <button class='w-3/4base' @click.prevent='addAttachmentFromUrl'>
                        <i class='material-icons text-base'>done</i>
                      </button>
                      <button class='w-3/4base' @click.prevent='addAttachmentFromUrl'>
                        <i class='material-icons text-base' @click.prevent='showUrlInput = false'>close</i>
                      </button>
                    </div>
                  </template>
                </px-input>
              </div>
            </div>
          </transition>
        </dropzone>
      </transition-group>
    </draggable>
    <progress v-if='uploadPercentage' max='100' :value.prop='uploadPercentage'/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Draggable from 'vuedraggable'
import { fileToRawAttachment, isSupportedFormat, upload, deleteAttachments } from '../../../lib/storage'
import AttachmentEditorCell from './AttachmentEditorCell'
import Dropzone from '../../components/UI/Dropzone'
import PxInput from '../../components/UI/inputs/PxInput'
import vimeo from '../../../lib/vimeo'
import mixcloud from '../../../lib/mixcloud'
import { imageFromPdf } from '../../../lib/pdf-reader'
import imageLib from '../../../lib/image'

export default {
  name: 'AttachmentsEditor',
  components: { Draggable, Dropzone, AttachmentEditorCell, PxInput },
  props: {
    value: { type: [Array, Object], default: () => ([]) },
    poster: { type: String, default: '' },
    authorId: { type: String, default: '' },
    sizes: { type: Object, default: () => ({ large: 2048, small: 512 }) },
    maxNumber: { type: Number, default: 0 },
    noCaption: Boolean,
    noUrl: Boolean,
    noCrop: Boolean,
    allowDuplicates: Boolean,
    dropzoneSelector: { type: String, default: '' },
    dropzoneMessage: { type: String, default: 'Drop Files Here' }
  },

  data: () => ({
    /** @type(PostAttachment|RawAttachment)[] */
    attachments: [],
    removedAttachments: [],
    showUrlInput: false,
    urlToInsert: '',
    showDragOverlay: false,
    withObjectFitContain: [],
    uploadPercentage: 0,
    dropzoneClass: '',
    dragging: false,
    dragOptions: {
      animation: 200,
      group: 'tabs',
      disabled: false,
      ghostClass: 'ghost'
    },
    thumbnailCover: true
  }),

  computed: {
    ...mapState(['user']),
    posterId () {
      return this.poster || this.attachments[0].id
    },
    allowUrl () { return !this.noUrl }
  },

  watch: {
    value(newValue) {
      this.convertToAttachments(newValue)
    }
  },

  created () {
    this.convertToAttachments(this.value)
  },

  mounted () {
    this.setSpanOnLastGridCell ()
  },

  methods: {
    openFileDialog () {
      if (this.$refs.input) {
        this.$refs.input.click ()
      }
    },

    openEmbedDialog () {
      this.showEmbedDialog = true
    },

    addFilesFromOpenDialog(e) {
      this.addFiles(e.target.files)
      e.target.value = ''
    },

    async addAttachmentFromUrl () {
      if (!this.urlToInsert) {
        return
      }
      const attachment = await this.makeAttachmentFromUrl(this.urlToInsert)
      if (attachment) {
        this.showUrlInput = false
        this.attachments.push(attachment)
        this.updateAttachmentsOrder ()
      }
    },

    addFiles(files) {
      let addedFiles = Array.from(files)
        .filter(file => isSupportedFormat(file))
      if (!this.allowDuplicates) {
        addedFiles = addedFiles.filter(file => !this.attachments.find(data => {
          if (!data.file) return false
          return data.file.name === file.name &&
              data.file.lastModified === file.lastModified &&
              data.file.size === file.size
        }))
      }
      addedFiles
        .sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0)
        .forEach(/** @type File */ async file => {
          if (file.type === 'application/pdf') {
            const attachmentData = fileToRawAttachment(file)
            const url = URL.createObjectURL(file)
            const image = await imageFromPdf(url)
            const blob = await imageLib.canvasToBlob(image, 'image/jpeg')
            attachmentData.image = await imageLib.imageFromFile(blob)
            this.attachments.push(attachmentData)
            URL.revokeObjectURL(url)
          } else {
            this.attachments.push(fileToRawAttachment(file))
          }
        })

      this.updateAttachmentsOrder ()
    },

    updateAttachmentsOrder () {
      this.attachments.forEach((a, i) => { a.order = i })
      this.setSpanOnLastGridCell ()
    },

    async uploadNewAttachments () {
      if (!this.authorId && !this.user) return
      this.updateAttachmentsOrder ()
      /** @type RawAttachment[] */
      const rawAttachments = this.attachments.filter(a => a.file instanceof Blob)
      rawAttachments.forEach(a => this.$set(a, 'progress', 1))
      try {
        const authorId = this.authorId || this.user.uid
        const uploadedAttachments = await upload(authorId, rawAttachments, (id, progress) => {
          const index = this.attachments.findIndex(a => a.id === id)
          if (!index) return
          if (progress > 0) {
            this.$set(this.attachments[index], 'progress', progress)
          }
        })
        this.attachments = [...this.attachments.filter(a => !a.file), ...uploadedAttachments]
          .sort((a, b) => a.order - b.order)
      } catch (e) {
        throw new Error({ ...e })
      }
    },

    async deleteMarkedAttachments () {
      const toDelete = this.removedAttachments // attachments.filter(a => a.removed)
      if (!toDelete.length) return
      const authorId = this.authorId || this.user.uid
      await deleteAttachments(authorId, toDelete)
    },

    async processAttachments () {
      await this.uploadNewAttachments ()
      await this.deleteMarkedAttachments ()
      return this.attachments.reduce((res, item) => {
        const { id, name, html, caption, order, type, srcSet, pointOfInterest } = item
        res[id] = { order, type, srcSet }
        if (name) res[id].name = name
        if (html) res[id].html = html
        if (caption) res[id].caption = caption
        if (pointOfInterest) res[id].caption = pointOfInterest
        return res
      }, {})
    },

    removeAttachment(id) {
      const index = this.attachments.findIndex(a => a.id === id)
      if (index < 0) return
      const attachmentToRemove = this.attachments[index]
      if (attachmentToRemove.hasOwnProperty('file') && (attachmentToRemove.file instanceof File || attachmentToRemove.file instanceof Blob)) {
        this.attachments.splice(index, 1)
      } else {
        // this.$set(this.attachments[index], 'removed', true)
        const removed = this.attachments.splice(index, 1)
        this.removedAttachments.push(removed)
      }
      this.$emit('remove', id)
      this.updateAttachmentsOrder ()
    },

    setPoster(id) {
      this.$emit('set-poster', id)
    },

    /** @param {{}|[]} inputAttachments */
    convertToAttachments(inputAttachments) {
      if (Array.isArray(inputAttachments)) {
        this.attachments = inputAttachments
      } else {
        this.attachments = Object.entries(inputAttachments).reduce((res, [id, value]) => {
          res.push({ ...value, id })
          return res
        }, []).sort((a, b) => a.order - b.order)
      }
      this.updateAttachmentsOrder ()
    },

    onDragging () {
      // return event.related.className.indexOf('new-attachment-cell') === -1
    },

    onEndDragging () {
      this.dragging = false
      this.updateAttachmentsOrder ()
    },

    setSpanOnLastGridCell () {
      if (!this.$refs['attachments-grid'] || !this.$refs['new-attachment-cell']) return
      const { gridTemplateColumns } = window.getComputedStyle(this.$refs['attachments-grid'].$el)
      const numColumns = gridTemplateColumns.split(' ').length
      const span = numColumns - this.attachments.length % numColumns
      this.$refs['new-attachment-cell'].$el.style.gridColumn = `span ${span}`
    },

    /**
     * @param url
     * @return {Promise<PostAVAttachment|PostEmbedAttachment|never>}
     */
    async makeAttachmentFromUrl(url) {
      if (!url) {
        return Promise.reject(new Error('Empty url'))
      }
      if (vimeo.isVimeoVideoUrl(url)) {
        const vimeoEmbed = await vimeo.getVimeoVideoInfo(url)
        return vimeo.castEmbedToAttachment(url, vimeoEmbed)
      }
      if (mixcloud.isMixCloudUrl(url)) {
        const mixcloudEmbed = await mixcloud.getMixCloudUrlInfo(url)
        return mixcloud.castEmbedToAttachment(mixcloudEmbed)
      }
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../../styles/mixins";
  $h: 200px;
  .attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
    grid-gap: 5px;
    grid-auto-rows: 256px;
    @apply mb-base;

    .preview-wrap {
      position: relative;
      width: 100%;
      height: 100%;

      .preview {}
    }
  }
  .new-attachment-cell{
    transition: 0s !important;
    @media(max-width: 548px) {
      grid-column: span 1 / auto !important;
    }
  }
  .drag-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 10000;
    background: rgba(170, 179, 182, 0.5);
    border: 5px dashed rgba(170, 179, 182, 1);
    color: #fff;

    &.hover {
      background: rgba(179, 205, 214, 0.98);
    }
  }

  i.remove {
    $w: 12px;
    $c: rgb(94, 94, 94);
    display: inline-block;
    position: absolute;
    box-sizing: border-box;
    width: $w;
    height: $w;
    padding: 0;

    &::before, &::after {
      $w: $w * 1;
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      width: $w;
      height: $w;
      border-right: 1px solid $c;
      box-sizing: border-box;
    }
    &::before {
      transform: translate(-50%, -50%) rotateZ(45deg) translateX(-$w/2 + 0.5px);
    }
    &::after {
      transform: translate(-50%, -50%) rotateZ(-45deg) translateX(-$w/2+0.5px);
    }
  }

  .flip-list-move {
    transition: transform 0.5s;
  }

  .no-move {
    transition: transform 0s !important;
  }

  .ghost {
    opacity: 0.5;
  }
</style>
