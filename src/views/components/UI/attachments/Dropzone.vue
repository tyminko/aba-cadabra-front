<template>
  <div ref="dropzone" :class="{dropzone:isDroppable}">
    <slot />
    <template v-if="isDroppable">
      <div
        ref="dropzone-overlay"
        v-show="showOverlay"
        class="dropzone-overlay"
        :class="actionClass">
        <slot name="dropzone-message">
          <div class="dropzone-message">{{message}}</div>
        </slot>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'Dropzone',

  props: {
    selector: { type: String, default: '' },
    messages: {
      type: Object,
      default: () => ({
        over: 'Drop File Here',
        leave: 'Drug File Here'
      })
    }
  },

  data: () => ({
    message: '',
    actionClass: '',
    showOverlay: false,
    isDroppable: false
  }),

  created () {
    this.isDroppable = this.isDragAndDropCapable()
  },

  mounted () {
    this.setupDropzone()
  },

  methods: {
    setupDropzone () {
      if (!this.isDroppable) return
      const dropzone = this.getDropzone()
      if (!dropzone) return
      const overlay = this.$refs['dropzone-overlay']
      dropzone.append(overlay)
      const events = ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop']
      events.forEach(eName => {
        dropzone.addEventListener(eName, e => {
          e.preventDefault()
          e.stopPropagation()
        }, false)
      })
      dropzone.addEventListener('dragover', e => {
        this.showOverlay = true
        this.message = this.messages.over
        this.actionClass = 'hover'
        this.$emit('dragover')
      })
      dropzone.addEventListener('dragleave', () => {
        this.message = this.messages.leave
        this.actionClass = ''
        this.$emit('dragleave')
      })
      dropzone.addEventListener('drop', e => {
        this.showOverlay = false
        this.actionClass = ''
        this.$emit('drop', e.dataTransfer.files)
      })
    },

    getDropzone () {
      const customDropzone = this.selector
        ? document.querySelector(this.selector)
        : null
      if (this.selector && !customDropzone) {
        console.warn(`Dropzone: selector "${this.selector}" does not match anything. A default dropzone is used instead`)
      }
      return customDropzone || this.$refs['dropzone']
    },

    isDragAndDropCapable () {
      const div = document.createElement('div')
      return (('draggable' in div) ||
          ('ondragstart' in div && 'ondrop' in div)) &&
          'FormData' in window &&
          'FileReader' in window
    }
  }
}
</script>

<style lang='scss'>
  .dropzone{
    position: relative;
    .dropzone-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      z-index: 10000;
      background: rgb(199, 199, 199, 0.74);
      border: 5px dashed rgb(170, 179, 182, 1);
      color: #fff;

      &.hover {
        background: rgba(192, 192, 192, 0.98);
      }
    }
  }
</style>
