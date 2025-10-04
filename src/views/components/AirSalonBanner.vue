<template>
    <div class="airsalon-logo">
        <a href="https://spaces.airberlinalexanderplatz.de/airsalon" target="_blank" @click="playRandomMusic" :class="{ playing: isPlaying }">
            <img src="/airsalon-logo.png" alt="AIR SALON" class="airsalon-image" />
        </a>
        <audio ref="audioPlayer" :src="currentTrack" @ended="playNextTrack" preload="none"></audio>
    </div>
</template>

<script>
export default {
  name: 'AirSalonBanner',
  data () {
    return {
      currentTrack: null,
      isPlaying: false,
      // Sample tracks from Air Salon archive - you can add more actual audio URLs
      tracks: [
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/hakka-senaida-ng.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/il-repond-jacob-lambrecht.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/the-list-making-enthusiasm.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/three-categories.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/however-uncertainly-across-space.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/nos-plats-aigres.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/voice-memos.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/how-many-linear-meters.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/whisper-me-this.mp3',
        'https://spaces.airberlinalexanderplatz.de/airsalon/audio/downpour-reverie.mp3'
      ]
    }
  },
  methods: {
    playRandomMusic () {
      if (this.isPlaying) {
        this.$refs.audioPlayer.pause()
        this.isPlaying = false
        return
      }

      // Select a random track
      const randomIndex = Math.floor(Math.random() * this.tracks.length)
      this.currentTrack = this.tracks[randomIndex]

      // Play the track
      this.$refs.audioPlayer.load()
      this.$refs.audioPlayer.play()
      this.isPlaying = true
    },
    playNextTrack () {
      if (this.isPlaying) {
        // Play another random track when current one ends
        const randomIndex = Math.floor(Math.random() * this.tracks.length)
        this.currentTrack = this.tracks[randomIndex]
        this.$refs.audioPlayer.load()
        this.$refs.audioPlayer.play()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.airsalon-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: auto;
    transition: filter 0.2s ease-in-out;
    background-color: #ffffff;
    padding: 0.5rem;

    .airsalon-image {
        max-height: 60px;
        width: auto;
        object-fit: contain;
        transition: all 0.2s ease-in-out;
        &:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
        }
    }

    a {
        text-decoration: none;
        cursor: pointer;
        position: relative;
        display: block;

        &:hover {
            .airsalon-image {
                filter: brightness(1.2);
                transform: scale(1.05);
            }
        }

        &.playing {
            .airsalon-image {
                animation: pulse 2s infinite;
            }

            &::after {
                content: '♪';
                position: absolute;
                right: -20px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8rem;
                animation: bounce 1s infinite;
            }
        }
    }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(-50%); }
        40% { transform: translateY(-60%); }
        60% { transform: translateY(-55%); }
    }
}
</style>
