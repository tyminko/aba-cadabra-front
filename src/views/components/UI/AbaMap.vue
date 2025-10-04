<template>
  <gmap-map
    ref="map"
    :center="latLng"
    :zoom="zoom"
    :options="mapOptions"
    class="aba-map h-x3" />
</template>

<script>
import { gmapApi } from 'vue2-google-maps'
import { abaMapStyle } from '../../../lib/map'

export default {
  name: 'AbaMap',
  props: {
    center: { type: Object, default: () => ({ lat: 52.5220676, lng: 13.4121466 }) },
    zoomRadius: { type: Number, default: 0.12 },
    zoom: { type: Number, default: 17 },
    markers: { type: Array, default: () => ([]) }
  },

  data: () => ({
    mapOptions: {
      disableDefaultUI: true,
      backgroundColor: '#fff',
      styles: [...abaMapStyle.basic]
    },
    markerInstances: [],
    map: null
  }),

  computed: {
    google: gmapApi,

    latLng () {
      return this.center
    }
  },

  created () {
    console.log('AbaMap created, Google API available:', !!this.google) // Debug log
  },

  async mounted () {
    console.log('AbaMap mounted, markers:', this.markers.length) // Debug log
    if (this.$refs.map) {
      try {
        await this.init()
        console.log('Map initialized successfully') // Debug log
        if (this.markers.length) {
          this.setupMarkers()
        }
      } catch (error) {
        console.error('Error initializing map:', error) // Debug log
      }
    } else {
      console.error('Map ref not found') // Debug log
    }
  },

  watch: {
    markers () { this.setupMarkers() },
    $route () { this.setupMarkers() }
  },

  methods: {
    init () {
      return this.$refs.map.$mapPromise.then(map => {
        console.log('Map promise resolved, map object:', map) // Debug log
        this.map = map
      }).catch(error => {
        console.error('Map promise rejected:', error) // Debug log
        throw error
      })
    },

    zoomToMarkers () {
      if (!this.markerInstances.length) return
      if (this.markerInstances.length === 1) {
        this.map.setCenter(this.markerInstances[0].latLng)
        this.map.setZoom(this.zoom)
      } else {
        // const bounds = markersBounds(this.google, this.markerInstances)
        const bounds = {
          north: this.center.lat - this.zoomRadius / 6,
          south: this.center.lat + this.zoomRadius / 6,
          west: this.center.lng - this.zoomRadius,
          east: this.center.lng + this.zoomRadius
        }
        this.map.fitBounds(bounds)
      }
    },

    async setupMarkers () {
      this.clearMarkers()
      if (!this.markers.length) return
      if (!this.map) {
        await this.$nextTick()
        await this.init()
      }
      const markers = this.markers.sort((m1, m2) => parseFloat(m1.lat) - parseFloat(m2.lat))
      markers.forEach(mData => {
        const markerData = { ...mData }
        const markerId = markerData.id || `marker-${Date.now()}-${Math.random()}`
        console.log('Generated markerId in setupMarkers:', markerId) // Debug log
        if (this.map) {
          const { lat, lng } = mData
<<<<<<< HEAD
          console.log('Creating standard Google Maps marker for:', mData) // Debug log
          console.log('Available fields in marker data:', Object.keys(mData)) // Debug log

          // Use standard Google Maps Marker with SVG icon (working version)
          const m = new this.google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            title: mData.title || 'Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#ff6b6b" stroke="#fff" stroke-width="2"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${mData.countNumber || mData.label || mData.eventNumber || mData.number || mData.id || '?'}</text>
                </svg>
              `),
              scaledSize: new this.google.maps.Size(40, 40),
              anchor: new this.google.maps.Point(20, 20)
            }
          })
=======
          const m = new this.MarkerClass({ lat, lng }, markerEl)
>>>>>>> 7e362667fb9abdd1eb76dcc20e26d00c5d95275e

          // Create InfoWindow for this marker
          const eventNumber = mData.countNumber || mData.label || mData.eventNumber || mData.number || mData.id || '?'
          // Remove # symbol from event number for URL
          const cleanEventNumber = eventNumber.replace('#', '')

          // Check if we have a token or ID for the event route
          const eventToken = mData.token || mData.eventToken || mData.eventId || mData.id
          // Use the provided URL if available, otherwise generate one based on available data
          // Try to use event route if we have a token, otherwise fall back to programme route
          const eventUrl = mData.url || (eventToken ? `/event/${eventToken}` : `/programme/${cleanEventNumber}`)
          console.log('Event data for URL generation:', { mData, eventNumber, cleanEventNumber, eventToken, eventUrl }) // Debug log
          console.log('InfoWindow title will be:', mData.title || `Event #${eventNumber}`) // Debug log
          console.log('Generated URL for navigation:', eventUrl) // Debug log

          const infoWindow = new this.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 300px;">
                <div style="margin-bottom: 8px;">
                  <strong style="color: #ff6b6b; font-size: 14px; cursor: pointer;" 
                          id="title-${markerId}"
                          onclick="console.log('Title clicked, navigating to:', '${eventUrl}'); window.location.href='${eventUrl}'; return false;"
                          onmouseover="this.style.textDecoration='underline'" 
                          onmouseout="this.style.textDecoration='none'">
                    ${mData.title || `Event #${eventNumber}`}
                  </strong>
                </div>
                ${mData.description ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${mData.description}</p>` : ''}
              </div>
            `,
            pixelOffset: new this.google.maps.Size(0, -40)
          })

<<<<<<< HEAD
          // Store InfoWindow reference with marker
          m.infoWindow = infoWindow

          // Add click listener to the standard Google Maps marker
          m.addListener('click', () => {
            console.log('Standard marker clicked:', mData) // Debug log
            console.log('Opening popup with URL:', eventUrl) // Debug log

            // Close all other InfoWindows
=======
          // Add click listener to show InfoWindow
          markerEl.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()

            // Close any open InfoWindows first
>>>>>>> 7e362667fb9abdd1eb76dcc20e26d00c5d95275e
            this.markerInstances.forEach(marker => {
              if (marker.infoWindow && marker !== m) {
                marker.infoWindow.close()
              }
            })

            // Open this marker's InfoWindow
            console.log('Opening InfoWindow for marker:', markerId) // Debug log
            infoWindow.open({
              map: this.map,
              anchor: m,
              shouldFocus: false
            })

<<<<<<< HEAD
            // Add fallback click listener after InfoWindow opens
            this.$nextTick(() => {
              setTimeout(() => {
                this.addFallbackClickListener(markerId, eventUrl)
              }, 300)
            })

            // Emit the marker click event
            this.$emit('marker-click', mData)
          })

=======
            // Emit the marker click event as before
            this.$emit('marker-click', mData)
          })

          // Store InfoWindow reference with marker
          m.infoWindow = infoWindow

          m.setMap(this.map)
>>>>>>> 7e362667fb9abdd1eb76dcc20e26d00c5d95275e
          this.markerInstances.push(m)
        }
      })
      this.zoomToMarkers()
    },

    clearMarkers () {
      this.markerInstances.forEach(m => {
        if (m.infoWindow) {
          m.infoWindow.close()
        }
        m.setMap(null)
      })
      this.markerInstances = []
    },

    addFallbackClickListener (markerId, eventUrl) {
      // Fallback click listener for the button
      const titleElement = document.getElementById(`title-${markerId}`)
      console.log('Fallback: Looking for title element:', `title-${markerId}`, titleElement) // Debug log
      if (titleElement) {
        console.log('Fallback: Adding click listener to title button:', markerId, eventUrl) // Debug log
        titleElement.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('Fallback: Title button clicked, navigating to:', eventUrl) // Debug log
          window.location.href = eventUrl
        })
      } else {
        console.log('Fallback: Title element not found:', `title-${markerId}`) // Debug log
      }
    },

    openMarkerPopup (marker, markerData, markerId) {
      console.log('Opening popup for marker:', markerId) // Debug log

      // Close all other InfoWindows
      this.markerInstances.forEach(m => {
        if (m.infoWindow && m !== marker) {
          m.infoWindow.close()
        }
      })

      // Open this marker's InfoWindow
      if (marker.infoWindow) {
        marker.infoWindow.open({
          map: this.map,
          anchor: marker,
          shouldFocus: false
        })

        // InfoWindow is now open

        // Emit the marker click event
        this.$emit('marker-click', markerData)
      }
    }
  }
}
</script>

<style lang="scss">
  .aba-map {
    .gm-style {
      & > .gmnoprint,
      & > .gmnoscreen,
      & > [draggable='false'],
      & > div > a {
        display: none !important;
      }
    }
  }
</style>
