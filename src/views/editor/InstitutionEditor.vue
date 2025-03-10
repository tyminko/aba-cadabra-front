<template>
  <div>
    <dropdown-select
      v-model="postStatus"
      label="Publication Status"
      :options="postStatusList"
      class="mr-base"/>
    <attachments-editor
      ref="attachmentsEditor"
      :value="logo"
      :max-number="1"
      no-caption
      no-url
      no-crop
      dropzone-message="Drop Logo Image Here"/>
    <px-input
      ref="title"
      v-model="postData.title"
      :required="true"
      :placeholder="`Partner name`"
      @validated="validateForm"
      class="xl"/>
    <px-input
      ref="country"
      v-model="postData.country"
      :required="true"
      @validated="validateForm"
      placeholder="Country"/>
    <px-input
      ref="url"
      v-model="postData.url"
      :required="true"
      @validated="validateForm"
      placeholder="Link"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PxInput from '../components/UI/inputs/PxInput.vue'
import AttachmentsEditor from './attachments/AttachmentsEditor.vue'
import DropdownSelect from '../components/UI/DropdownSelect.vue'
import { usePostEditor } from '../../composables/usePostEditor'

defineOptions({
  name: 'InstitutionEditor'
})

interface Props {
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<{
  (e: 'validated', value: boolean): void
}>()

interface PostData {
  title: string
  logo: any | null
  country: string
  url: string
  attachments?: Record<string, any>
}

const emptyPostData: PostData = {
  title: '',
  logo: null,
  country: '',
  url: ''
}

const processing = ref(false)
const titleRef = ref<InstanceType<typeof PxInput> | null>(null)
const countryRef = ref<InstanceType<typeof PxInput> | null>(null)
const urlRef = ref<InstanceType<typeof PxInput> | null>(null)
const attachmentsEditorRef = ref<InstanceType<typeof AttachmentsEditor> | null>(null)

const {
  postData,
  postStatus,
  postStatusList
} = usePostEditor(emptyPostData)

const attachments = computed(() => Object.values(postData.value.attachments || {}))

const logo = computed(() => {
  return postData.value.logo
    ? [postData.value.logo]
    : attachments.value.length
      ? [attachments.value[0]]
      : []
})

const validateForm = () => {
  const refs = {
    title: titleRef.value,
    country: countryRef.value,
    url: urlRef.value
  }
  const errorField = Object.entries(refs).find(([_, ref]) => {
    if (!ref) return true
    return (ref as any).isValid !== true
  })
  emit('validated', !errorField)
}
</script>

<style lang="scss">
  .institution-editor {
  }
</style>
