<template>
  <div class="event-editor">
    <dropdown-select
      v-model="postStatus"
      label="Publication Status"
      :options="postStatusList"
      class="mr-base"/>
    <div class="flex flex-row flex-wrap">
      <dropdown-select
        v-model="partOfProgrammeId"
        label="Part of a programme"
        :options="programmeOptions"
        class="mr-base"/>
      <px-input
        v-if="partOfProgrammeId!=='--'"
        v-model="countNumber"
        :minWidth="50"
        :label="`${eventProgrammeLabel} #`"
        :placeholder="`${defaultCountNumber}`"
        class="lg">
      </px-input>
    </div>
    <div class="flex flex-row flex-wrap">
      <date-time-picker
        ref="date"
        v-model="postData.date"
        required
        label="Date"
        class="mr-base flex-1"/>
      <date-time-picker
        ref="endDate"
        v-model="postData.endDate"
        label="End Date"
        class="flex-1"/>
    </div>
    <location v-model="location"/>
    <px-input
      v-model="postData.title"
      :placeholder="`${eventProgrammeLabel} title`"
      class="xl"/>
    <credits-input v-model="participants"/>
    <tags-input
      v-model="supportedBy"
      placeholder="Add Institution"
      label="Supported By"
      :query="institutionsQuery"
      :allow-creation="false"/>
    <tags-input v-model="tags" label="Tags"/>
    <attachments-editor
      ref="attachments-editor"
      :value="attachments"
      :author-id="authorId"
      :poster="posterId"
      @remove="onRemoveAttachment"
      @set-poster="posterId = $event"/>
    <text-editor
      ref="text-editor"
      v-model="content"
      label="Content"/>
  </div>
</template>

<script>
import { db } from '../../lib/firebase'
import PostEditorMixin from '../../mixins/post-editor'
import DropdownSelect from '../components/UI/DropdownSelect'
import CreditsInput from '../components/UI/inputs/CreditsInput'
import DateTimePicker from '../components/UI/inputs/DateTimePicker'
import Location from '../components/UI/inputs/Location'
import TagsInput from '../components/UI/inputs/TagsInput'
import PxInput from '../components/UI/inputs/PxInput'
import AttachmentsEditor from './attachments/AttachmentsEditor'
import TextEditor from '../components/UI/TextEditor'

export default {
  name: 'EventEditor',
  mixins: [PostEditorMixin],
  components: { TextEditor, AttachmentsEditor, PxInput, TagsInput, Location, DateTimePicker, CreditsInput, DropdownSelect },
  props: {},

  data: () => ({
    postData: {},
    emptyPostExtraData: {
      date: '',
      endDate: '',
      countNumber: null,
      partOfProgramme: null,
      participants: '',
      supportedBy: [],
      type: 'event'
    },
    programmes: null,
    nextCounts: {}
  }),

  computed: {
    participants: {
      get () { return Object.values(this.postData.participants) || [] },
      set (newValue) { this.$set(this.postData, 'participants', newValue) }
    },
    location: {
      get () { return this.postData.location || {} },
      set (newValue) { this.$set(this.postData, 'location', newValue) }
    },
    supportedBy: {
      get () { return this.postData.supportedBy },
      set (newValue) { this.$set(this.postData, 'supportedBy', newValue) }
    },
    countNumber: {
      get () { return this.postData.countNumber },
      set (newValue) {
        this.$set(this.postData, 'countNumber', newValue)
        this.$emit('set-header', this.headerTitle)
      }
    },
    defaultCountNumber () {
      const programmeId = (this.postData.partOfProgramme || {}).programmeId
      if (this.value && this.partOfProgrammeId === this.value.partOfProgramme.programmeId) {
        return this.value.countNumber
      }
      if (this.nextCounts.hasOwnProperty(programmeId)) {
        return this.nextCounts[programmeId]
      }
      return ''
    },
    headerTitle () {
      if (this.postData.partOfProgramme) {
        return `${this.postData.partOfProgramme.singlePostLabel} # ${this.postData.countNumber}`
      }
      return ''
    },
    eventProgrammeLabel () {
      return this.postData.partOfProgramme
        ? this.postData.partOfProgramme.singlePostLabel
        : this.postData.type
    },
    partOfProgrammeId: {
      get () { return (this.postData.partOfProgramme || {}).programmeId || '--' },
      async set (newValue) {
        if (newValue !== '--') {
          const { singlePostLabel, title, id } = this.programmes.find(p => p.id === newValue)
          this.$set(this.postData, 'partOfProgramme', { singlePostLabel, title, programmeId: id })
          this.postData.countNumber = await this.getActualCountForProgramme(newValue)
        } else {
          this.$set(this.postData, 'partOfProgramme', null)
          this.postData.countNumber = null
        }
        this.$emit('set-header', this.headerTitle)
      }
    },
    programmeOptions () {
      return (this.programmes || []).reduce((res, p) => ({ ...res, [p.id]: p.title }), { '--': 'No programme' })
    }
  },

  created () {
    this.getProgrammes()
    this.$emit('set-header', this.headerTitle)
  },

  methods: {
    async institutionsQuery (str) {
      if (!this.institutions) {
        this.institutions = await db.collection('institutions')
          .get()
          .then(snapshot => {
            return snapshot.docs.map(doc => {
              const { title } = doc.data()
              return { id: doc.id, title }
            })
          })
      }
      return this.institutions.filter(i => i.title.toLowerCase().includes(str.toLowerCase()))
    },
    async getProgrammes () {
      if (!this.programmes) {
        this.programmes = await db.collection('programmes')
          .get()
          .then(snapshot => {
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          })
      }
    },
    async getActualCountForProgramme (programmeId) {
      if (this.value && this.partOfProgrammeId === this.value.partOfProgramme.programmeId) {
        return this.value.countNumber
      }
      if (this.nextCounts.hasOwnProperty(programmeId)) {
        return this.nextCounts[programmeId]
      }
      const lastCount = await db.collection('posts')
        .where('partOfProgramme.programmeId', '==', programmeId)
        .orderBy('countNumber', 'desc')
        .limit(1)
        .get()
        .then(snapshot => {
          return snapshot.docs.map(doc => (doc.data() || {}).countNumber)[0]
        })
      this.$set(this.nextCounts, programmeId, (parseInt(lastCount) || 0) + 1)
      return this.nextCounts[programmeId]
    }
  }
}
</script>

<style lang="scss">
  .event-editor {
  }
</style>
