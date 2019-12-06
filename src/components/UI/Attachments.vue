<template>
  <div class="attachmnets">
    <div ref="fileform" @click="openFileDialog">
      <span v-if="!filesData.length" class="drop-files">Drop the files here!</span>
      <input
        ref="input"
        type="file"
        style="display:none"
        multiple
        accept="image/*"
        @change="addFilesFromOpenDialog">
      <div class="previews">
        <div v-for="(preview, key) in previews"
             :key="key"
             :style="{backgroundImage: `url(${preview.url})`}"
             :class="{err:preview.status==='err'}"
             class="preview">
          &nbsp;
          <button class="remove" @click.stop="removeFile( preview.key )">
            Remove
          </button>
        </div>
      </div>
    </div>
    <progress max="100" :value.prop="uploadPercentage" />
    <a v-show="filesData.length > 0" class="submit-button" @click="submitFiles()">Submit</a>
  </div>
</template>

<script>
import Vue from 'vue'
import imageLib from '../../lib/image'

export default {
  name: 'Attachments',

  props: {
    value: { type: Object, default: () => ({}) },
    sizes: { type: Object, default: () => ({ full: 2048, preview: 512 }) }
  },

  data: () => ({
    dragAndDropCapable: false,
    uploadPercentage: 0
  }),

  computed: {
    filesData: {
      get () {
        return this.value
      },
      set (newValue) {
        this.$emit('input', Object.entries(newValue)
          .reduce((res, [key, data], i) => {
            data.order = i
            res[key] = data
            return res
          }, {})
        )
      }
    },
    previews () {
      return Object.entries(this.filesData)
        .map(([key, item]) => {
          let data = {}
          if (!item.preview || item.preview.err) {
            data = { status: 'err', url: item.image ? item.image.src : 'x' }
          } else {
            data = { status: 'ok', url: item.preview.url }
          }
          data.key = key
          data.size = item.file ? item.file.size : null
          data.dimensions = item.image ? { w: item.image.width, h: item.image.height } : null
          data.order = item.order
          return data
        })
        .filter(item => !item.hasOwnProperty('deleted'))
        .sort((a, b) => a.order - b.order)
    }
  },

  mounted () {
    this.dragAndDropCapable = this.determineDragAndDropCapable()
    if (this.dragAndDropCapable) {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(eName => {
        this.$refs.fileform.addEventListener(eName, e => {
          e.preventDefault()
          e.stopPropagation()
        }, false)
      })

      this.$refs.fileform.addEventListener('drop', this.addDroppedFiles)
    }
  },

  methods: {
    openFileDialog () {
      if (this.$refs.input) {
        this.$refs.input.click()
      }
    },

    addDroppedFiles (e) {
      this.addFiles(e.dataTransfer.files)
    },

    addFilesFromOpenDialog (e) {
      this.addFiles(e.target.files)
    },

    addFiles (files) {
      const promises = []
      Array.from(files)
        .filter(file => imageLib.isJpgPngGif(file))
        .sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0)
        .forEach(file => {
          let fileData = {}
          promises.push(
            imageLib.imageFromFile(file)
              .then(image => {
                fileData = { file, image }
                Vue.set(this.filesData, file.name, fileData)
                this.resetFilesData()
              })
              .catch(err => {
                fileData = { file, image: null, err }
                Vue.set(this.filesData, file.name, fileData)
                this.resetFilesData()
              })
          )
        })
      return Promise.all(promises)
        .then(() => this.setPreviews())
    },

    setPreviews () {
      const promises = []
      Object.entries(this.filesData).forEach(([name, data]) => {
        if (!data.preview) {
          promises.push(imageLib.picaResize(data.image, this.sizes.preview)
            .then(canvas => {
              Vue.set(this.filesData, name, { ...data, preview: { raw: canvas, url: canvas.toDataURL() } })
            })
            .catch(err => {
              Vue.set(this.filesData, name, { ...data, preview: { err, url: '' } })
            })
          )
        }
      })
      return Promise.all(promises)
        .then(() => this.resetFilesData())
    },

    determineDragAndDropCapable () {
      const div = document.createElement('div')
      return (('draggable' in div) ||
        ('ondragstart' in div && 'ondrop' in div)) &&
        'FormData' in window &&
        'FileReader' in window
    },

    resetFilesData () {
      Vue.set(this, 'filesData', { ...this.filesData })
    },

    /*
        Removes a select file the user has uploaded
      */
    removeFile (key) {
      this.$emit('remove', key)
    }
  }
}
</script>

<style lang="scss">
  .attachmnets {
    form {
      min-height: 256px;
    }
    .previews {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
      grid-gap: 0.5rem;

      .preview {
        width: 256px;
        height: 256px;
        position: relative;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        // overflow: hidden;

        &.err:after {
          content: '!';
          position: absolute;
          width: 20px;
          height: 20px;
          line-height: 20px;
          text-align: center;
          top: 5px;
          right: 5px;
          border-radius: 50%;
          background: rgb(207, 152, 152);
          border: 1px solid rgba(255, 255, 255, 0.74);
          color: #fff;
        }

        img {
          width: 100%;
        }
      }
    }
    progress {
      width: 400px;
      margin: auto;
      display: block;
      margin-top: 20px;
      margin-bottom: 20px;
    }
  }
</style>
