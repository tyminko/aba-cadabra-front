import { ref } from 'vue'

export interface PostData {
  title: string
  logo: any | null
  country: string
  url: string
  attachments?: Record<string, any>
  [key: string]: any
}

interface StatusOption {
  value: string
  label: string
}

export function usePostEditor(emptyPostData: PostData) {
  const postData = ref<PostData>({ ...emptyPostData })
  const postStatus = ref('draft')
  const postStatusList: StatusOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' }
  ]

  return {
    postData,
    postStatus,
    postStatusList
  }
} 