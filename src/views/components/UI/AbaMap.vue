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
import { abaMapStyle, defineABAMarkerClass, getMarkerHtml } from '../../../lib/map'

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
    MarkerClass: null,
    markersStock: {},
    markerInstances: [],
    markerEl: null,
    markerInstance: null,
    map: null
  }),

  computed: {
    google: gmapApi,

    latLng () {
      return this.center
    }
  },

  async mounted () {
    if (this.$refs.map) {
      await this.init()
      if (this.markers.length) {
        this.setupMarkers()
      }
    }
  },

  watch: {
    markers () { this.setupMarkers() },
    $route () { this.setupMarkers() }
  },

  methods: {
    init () {
      return this.$refs.map.$mapPromise.then(map => {
        this.map = map
        this.MarkerClass = defineABAMarkerClass(this.google)
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
        const markerEl = getMarkerHtml(markerData, this.$refs.map.$el, this.markersStock)
        if (markerEl && this.MarkerClass && this.map) {
          const { lat, lng } = mData
          const m = new this.MarkerClass({ lat, lng }, markerEl)
          
          // Create InfoWindow for this marker
          const infoWindow = new this.google.maps.InfoWindow({
            content: `
              <div class="marker-popup">
                <h3>${mData.title || ''}</h3>
                ${mData.description ? `<p>${mData.description}</p>` : ''}
              </div>
            `,
            pixelOffset: new this.google.maps.Size(0, -40) // Offset to position popup above the custom marker
          })
          
          // Add click listener to show InfoWindow
          markerEl.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            
            // Close any open InfoWindows first
            this.markerInstances.forEach(marker => {
              if (marker.infoWindow) {
                marker.infoWindow.close()
              }
            })
            
            // Open this marker's InfoWindow
            infoWindow.open({
              map: this.map,
              anchor: m,
              shouldFocus: false
            })
            
            // Emit the marker click event as before
            this.$emit('marker-click', mData)
          })
          
          // Store InfoWindow reference with marker
          m.infoWindow = infoWindow
          
          m.setMap(this.map)
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
      this.markersStock = {}
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
