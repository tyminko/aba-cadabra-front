<template>
  <div class='transfer-wp-attachments'>
    <div class="actions">
      <button
        :disabled="processing"
        @click='process'
        class="transfer-button">
        <span v-if="!processing">Transfer Attachments</span>
        <span v-else>Processing...</span>
      </button>
      <!-- <v-btn :ripple='false' color='red' :disabled='true' :loading='processing' @click='deleteUsers'>
        Delete All
      </v-btn> -->
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class='attachments'>
      <div
        v-for='item in wpAttachments'
        :key='item.post.ID'
        class='item'>
        <img
          v-if="item.post.post_mime_type.startsWith('image/')"
          :src='thumbnailUrl(item)'
          :alt='`Attachment ${item.post.ID}`'>
      </div>
    </div>

    <div v-if="processing" class="progress">
      <strong>{{ Math.ceil(done) }}%</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import WP from '../../ABA-Data.json'

defineOptions({
  name: 'TransferWpAttachmentsView'
})

interface WPAttachment {
  post: {
    ID: number
    url: string
    post_mime_type: string
    post_parent: number
  }
  meta: {
    _wp_attachment_metadata?: {
      sizes?: {
        thumbnail?: {
          file?: string
        }
      }
    }
  }
}

interface WPData {
  attachment: WPAttachment[]
}

interface User {
  role: string
}

interface StoreState {
  user: User | null
}

const store = useStore<StoreState>()
const transfered = ref<number[]>([])
const processing = ref(false)
const error = ref<string | null>(null)

const wpAttachments = computed<WPAttachment[]>(() => {
  if (!store.state.user || store.state.user.role !== 'admin') return []
  return (WP as WPData).attachment
})

const done = computed(() => {
  if (wpAttachments.value.length === 0) return 0
  return (transfered.value.length / wpAttachments.value.length) * 100
})

watch(done, (value) => {
  if (value === 100) {
    processing.value = false
    error.value = null
  }
})

const process = async () => {
  error.value = null
  processing.value = true
  transfered.value = []

  try {
    const unusedAttachments = wpAttachments.value.filter(item => !attachmentIsUsed(item))
    if (unusedAttachments.length === 0) {
      error.value = 'No unused attachments found to transfer.'
      return
    }

    for (const attachment of unusedAttachments) {
      try {
        // TODO: Process unused attachments
        transfered.value.push(attachment.post.ID)
        await new Promise(resolve => setTimeout(resolve, 100)) // Simulate processing time
      } catch (err) {
        console.error(`Error processing attachment ${attachment.post.ID}:`, err)
        // Continue with next attachment
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    error.value = `Failed to process attachments: ${errorMessage}`
    console.error('Error processing attachments:', err)
  } finally {
    processing.value = false
  }
}

const thumbnailUrl = (item: WPAttachment): string => {
  const metadata = item.meta._wp_attachment_metadata
  const sizes = metadata?.sizes
  const thumbnail = sizes?.thumbnail
  const thumbFile = thumbnail?.file || null

  if (!thumbFile) return item.post.url
  const base = item.post.url.split('/')
  base.pop ()
  return base.join('/') + '/' + thumbFile
}

const attachmentIsUsed = (item: WPAttachment): boolean => {
  return !!item.post.post_parent
}
</script>

<style lang='scss'>
.transfer-wp-attachments {
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  height: calc(100vh - 76px);

  & > * {
    flex-shrink: 0;
  }

  .actions {
    margin-bottom: 1rem;

    .transfer-button {
      padding: 0.5rem 1rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    }
  }

  .error-message {
    color: #f44336;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
    background-color: #ffebee;
  }

  .progress {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: #2196F3;
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

    .item {
      background: #ccc;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;

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
