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
        const markerData = { ...mData } /* , active: true */
        const markerEl = getMarkerHtml(markerData, this.$refs.map.$el, this.markersStock)
        if (markerEl && this.MarkerClass && this.map) {
          const { lat, lng } = mData
          const m = new this.MarkerClass({ lat, lng }, markerEl)
          m.setMap(this.map)
          this.markerInstances.push(m)
        }
      })
      this.zoomToMarkers()
    },

    clearMarkers () {
      this.markerInstances.forEach(m => m.setMap(null))
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
