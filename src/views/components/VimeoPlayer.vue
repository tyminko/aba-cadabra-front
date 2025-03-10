<template>
  <div ref="boxRef" class="vimeo-player relative">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <template v-else>
      <vue-vimeo-player
        ref="playerRef"
        class="video-player"
        :style="videoDimensionsStyle"
        :options="playerOptions"
        :videoId="value.vimeoId"
        @ready="onPlayerReady"
        @error="onPlayerError"/>
      <div
        v-if="isInteractive"
        class="player-overlay absolute inset-0 flex items-center justify-center"
        @click="togglePlay">
        <div
          v-if="!isPlaying"
          class="play-button">
          <i class="material-icons text-4xl text-white opacity-75 hover:opacity-100 transition-opacity">play_circle_outline</i>
        </div>
      </div>
      <div
        v-if="loading"
        class="loading-overlay absolute inset-0 flex items-center justify-center">
        <div class="loading-spinner"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { vueVimeoPlayer } from 'vue-vimeo-player'

// Prop
const props = defineProp({
  value: {
    type: Object,
    required: true
  },
  isInteractive: {
    type: Boolean,
    default: true
  },
  cropPreview: {
    type: Boolean,
    default: false
  }
})

// Ref
const boxRef = ref(null)
const playerRef = ref(null)
const error = ref(null)
const loading = ref(true)
const isPlaying = ref(false)

// Constant
const playerOptions = {
  background: false,
  autoplay: false,
  loop: true,
  byline: false,
  portrait: false,
  title: false,
  fullscreen: true,
  responsive: true,
  controls: false
}

// Computed
const videoDimensionsStyle = computed(() => {
  if (!boxRef.value) return null

  if (!props.cropPreview) {
    return { width: '100%', height: '100%' }
  }

  const originalDimensions = props.value?.srcSet?.original?.dimension
  if (!originalDimensions) return null

  const { width: boxWidth, height: boxHeight } = boxRef.value.getBoundingClientRect ()
  const attachRatio = originalDimensions.w / originalDimensions.h
  const boxRatio = boxWidth / boxHeight

  if (attachRatio > boxRatio) {
    return {
      height: '100%',
      width: `${(originalDimensions.w / boxWidth) * 100}%`
    }
  } else {
    return {
      width: '100%',
      height: `${(originalDimensions.h / boxHeight) * 100}%`
    }
  }
})

// Method
const onPlayerReady = () => {
  loading.value = false
}

const onPlayerError = (err) => {
  error.value = `Failed to load video: ${err.message || 'Unknown error'}`
  loading.value = false
}

const togglePlay = async () => {
  if (!playerRef.value?.player) return

  try {
    const player = playerRef.value.player
    const paused = await player.getPaused ()

    if (paused) {
      await player.play ()
      isPlaying.value = true
    } else {
      await player.pause ()
      isPlaying.value = false
    }
  } catch (err) {
    error.value = `Failed to ${isPlaying.value ? 'pause' : 'play'} video: ${err.message || 'Unknown error'}`
  }
}

// Lifecycle
onMounted(() => {
  if (!props.value?.vimeoId) {
    error.value = 'No video ID provided'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (playerRef.value?.player) {
    playerRef.value.player.pause ()
  }
})

// Expose methods for parent component
defineExpose({
  togglePlay
})
</script>

<style lang="scss" scoped>
.vimeo-player {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 56.25%; // 16:9 aspect ratio
  background-color: #000;

  iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .player-overlay {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.1);
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }

  .loading-overlay {
    background: rgba(0, 0, 0, 0.5);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }

  .error-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    background: rgba(0, 0, 0, 0.7);
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
