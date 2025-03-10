<template>
  <div class=''>
    <select-input
      v-model='status'
      label='Programme Status'
      :options='statusList'
      class='mr-base'/>
    <text-input
      ref='title'
      v-model='title'
      label='Programme Title'
      required
      @validated='validateForm'
      class='lg'/>
    <text-input
      ref='single-label'
      v-model='singlePostLabel'
      required
      @validated='validateForm'
      label='Single Post Label'>
      <template #help>
        Used as part of a single post title: <span class='capitalize italic'>{{singlePostLabel}} #123</span>
      </template>
    </text-input>
    <text-editor v-model='text' label='Description'/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { db } from '../../lib/firebase'
import TextInput from '../components/UI/inputs/TextInput'
import TextEditor from '../components/UI/TextEditor'
import SelectInput from '../components/UI/inputs/SelectInput'
import { disconnectEventsFromProgramme } from '../../lib/parent-children-sync'

export default {
  name: 'ProgrammeEditor',
  components: { SelectInput, TextEditor, TextInput },

  props: {
    value: { type: Object, default: null }
  },

  data: function () {
    return {
      programmeData: {},
      originalJSON: null,
      defaultData: {
        singlePostLabel: '',
        title: '',
        status: '',
        text: ''
      },
      statusList: { public: 'Public', internal: 'Internal', draft: 'Draft' }
    }
  },

  computed: {
    ...mapState(['user']),
    adminOrEditor () {
      return this.user && (this.user.role === 'admin' || this.user.role === 'editor')
    },

    title: {
      get () { return this.programmeData.title || (this.value || {}).title || '' },
      set(newValue) {
        this.$set(this.programmeData, 'title', newValue)
        this.$emit('set-header', this.editorTitle)
      }
    },

    singlePostLabel: {
      get () { return this.programmeData.singlePostLabel || (this.value || {}).singlePostLabel || '' },
      set(newValue) { this.$set(this.programmeData, 'singlePostLabel', newValue) }
    },

    status: {
      get () { return this.programmeData.status || (this.value || {}).status || 'public' },
      set(newValue) { this.$set(this.programmeData, 'status', newValue) }
    },

    text: {
      get () { return this.programmeData.text || (this.value || {}).text || '' },
      set(newValue) { this.$set(this.programmeData, 'text', newValue) }
    },

    editorTitle () {
      return this.title
    },

    allowDelete () {
      return this.adminOrEditor && (this.value || {}).id
    }
  },

  created () {
    this.$emit('set-header', this.editorTitle)
  },

  mounted () {
    this.validateForm ()
    this.$emit('allowDelete', this.allowDelete)
  },

  watch: {
    user () {
      this.$emit('allowDelete', this.allowDelete)
    },
    value(value) {
      this.programmeData = { ...this.defaultData, ...value }
      this.$emit('allowDelete', this.allowDelete)
    }
  },

  methods: {
    validateForm () {
      const fields = ['title', 'single-label']
      const errorField = fields.find(ref => (this.$refs[ref] || {}).isValid !== true)
      this.$emit('validated', !errorField)
    },

    async save () {
      this.$emit('setProcessing', true)
      try {
        const progId = (this.value || {}).id
        if (!progId && !this.programmeData.status) {
          this.programmeData.status = this.status // be sure that new programme will be saved with a status
        }
        const progFields = this.fieldsToSave ()
        if (Object.keys(progFields).length) {
          const collectionRef = db.collection('programmes')
          if (progId) {
            await collectionRef.doc(progId).update(progFields)
          } else {
            await collectionRef.add(progFields)
          }
          this.$emit('setProcessing', false)
          this.$emit('saved')
          this.$emit('close')
        } else {
          this.$emit('setProcessing', false)
          this.$emit('close')
        }
      } catch (e) {
        console.error('%c save () %c e: ', 'background:#ff0000;color:#000', 'color:#00aaff', e)
        this.$emit('setProcessing', false)
      }
    },

    async remove () {
      if (!this.allowDelete) return
      this.$emit('setProcessing', true)
      try {
        await db.collection('programmes').doc(this.value.id).update({ status: 'trash' })
        await Promise.all([
          disconnectEventsFromProgramme(this.value.id)
        ])
        this.$emit('setProcessing', false)
        this.$emit('deleted')
        this.$emit('close')
      } catch (e) {
        this.$emit('setProcessing', false)
      }
    },

    fieldsToSave () {
      const original = this.value || {}
      return Object.keys(this.defaultData).reduce((res, key) => {
        if (typeof this.programmeData[key] === 'undefined') return res
        if (original.hasOwnProperty(key)) {
          if (this.programmeData[key] !== original[key]) {
            res[key] = this.programmeData[key]
          }
        } else {
          if (this.programmeData[key] !== this.defaultData[key]) {
            res[key] = this.programmeData[key]
          }
        }
        return res
      }, {})
    },

    requestClose () {
      this.$emit('close')
    }
  }

}
</script>

<style lang='scss'>
  .user-editor {
    background: #fff;
    .row > div {
      padding-top: 0;
      padding-bottom: 0;
    }
  }
  .v-select__selection, .v-list-item__title {
    text-transform: capitalize
  }
</style>
