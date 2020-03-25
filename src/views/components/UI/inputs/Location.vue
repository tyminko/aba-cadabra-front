<template>
  <div class="location">
    <px-input
      v-model.lazy="address"
      label="Location"
      class=""
      :error="error"
      lazy>
      <template v-slot:desc>
        <transition>
          <gmap-map v-show="latLng" ref="map" :center="latLng||defaultLatLng" :zoom="17" :options="mapOptions" class="map h-x3">
  <!--          <gmap-marker ref="myMarker" :position="latLng" />-->
          </gmap-map>
        </transition>
      </template>
    </px-input>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps'
import PxInput from './PxInput'
import { abaMapStyle, defineABAMarkerClass, getMarkerHtml } from '../../../../lib/map'

export default {
  name: 'Location',
  components: { PxInput },
  props: {
    value: { type: Object, default: () => ({}) }
  },

  data: () => ({
    geocoder: null,
    tmpAddress: '',
    tmpLatLng: null,
    defaultLatLng: { lat: 52.5220676, lng: 13.4121466 },
    mapOptions: {
      disableDefaultUI: true,
      backgroundColor: '#fff',
      styles: [...abaMapStyle.basic]
    },
    MarkerClass: null,
    markerEl: null,
    markerInstance: null,
    map: null,
    error: null
  }),

  computed: {
    address: {
      get () { return this.tmpAddress || this.value.address },
      async set (newValue) {
        // !!! DEBUG !!!
        console.log(`%c address.set() %c newValue: `, 'background:#ffbbff;color:#000', 'color:#00aaff', newValue)
        this.tmpAddress = newValue
        if (!newValue) {
          this.latLng = null
        } else {
          const location = await this.addressToLocation(newValue)
          // !!! DEBUG !!!
          console.log(`%c set() %c location: `, 'background:#ffbb00;color:#000', 'color:#00aaff', location)
          if (location === this.value) return
          // !!! DEBUG !!!
          console.log(`%c address.set() %c location: `, 'background:#ffbb00;color:#000', 'color:#00aaff', location)
          this.latLng = (location || {}).latLng || null
          this.tmpAddress = (location || {}).address || ''
          this.setMarker((location || {}).latLng)
          this.$emit('input', location)
        }
      }
    },
    latLng: {
      get () {
        if (this.tmpLatLng) return this.tmpLatLng
        // !!! DEBUG !!!
        console.log(`%c get() %c this.value: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.value)
        const { lat, lng } = this.value || {}
        return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
      },
      set (newValue) {
        this.tmpLatLng = newValue
      }
    },
    google: gmapApi
  },

  mounted () {
    if (this.$refs.map) {
      this.init()
      if (this.latLng) {
        this.setMarker(this.latLng)
      }
    }
  },

  methods: {
    init () {
      return this.$refs.map.$mapPromise.then(map => {
        this.map = map
        this.MarkerClass = defineABAMarkerClass(this.google)
      })
    },

    addressToLocation (addressStr) {
      // !!! DEBUG !!!
      console.log(`%c addressToLocation() %c this.value.address: `, 'background:#ffbbff;color:#000', 'color:#00aaff', this.value.address)
      if (!addressStr) return null
      if (addressStr === this.value.address) return this.value
      if (!this.geocoder) this.geocoder = new this.google.maps.Geocoder()
      return new Promise((resolve) => {
        this.geocoder.geocode({ 'address': addressStr }, async (results, status) => {
          if (status === 'OK') {
            const res = results[0]
            const location = res.geometry.location
            const latLng = { lat: location.lat(), lng: location.lng() }

            // !!! DEBUG !!!
            console.log(`%c () %c res: `, 'background:#00ddff;color:#000', 'color:#00aaff', res)

            resolve({
              id: res.place_id,
              address: res.formatted_address,
              country: (res.address_components.find(c => c.types.includes('locality')) || {}).long_name,
              countryCode: (res.address_components.find(c => c.types.includes('locality')) || {}).short_name,
              latLng: { ...latLng },
              lat: latLng.lat,
              lng: latLng.lng
            })
          } else {
            console.log('Geocode was not successful for the following reason: ' + status)
            resolve(null)
          }
        })
      })
    },

    async setMarker (location) {
      if (!location) return
      if (!this.map) {
        await this.$nextTick()
        await this.init()
      }
      if (!this.markerEl && this.$refs.map) {
        this.markerEl = getMarkerHtml({ ...location, active: true }, this.$refs.map.$el)
      }
      // !!! DEBUG !!!
      console.log(`%c setMarker() %c this.map: `, 'background:#00bbff;color:#000', 'color:#00aaff', this.map)
      console.log(`%c setMarker() %c this.markerEl: `, 'background:#00bbff;color:#000', 'color:#00aaff', this.markerEl)
      console.log(`%c setMarker() %c this.MarkerClass: `, 'background:#00bbff;color:#000', 'color:#00aaff', this.MarkerClass)

      if (this.markerInstance &&
        this.markerInstance.latLng.lat !== location.lat &&
        this.markerInstance.latLng.lng !== location.lng
      ) {
        this.markerInstance.setMap(null)
      }
      if (this.markerEl && this.MarkerClass && this.map) {
        // noinspection JSClosureCompilerSyntax
        this.markerInstance = new this.MarkerClass(location, this.markerEl)
        this.markerInstance.setMap(this.map)
      }
    },

    round (n) {
      return Math.round(n * 1000) / 1000
    }
  }
}
</script>

<!--suppress CssInvalidAtRule -->
<style lang="scss">
  @import "../../../../styles/marker";
  .location {
    .desc {
      padding: 0 !important;
      .map {
        @apply mt-sm;

        .gm-style {
          & > .gmnoprint,
          & > .gmnoscreen,
          & > [draggable='false'],
          & > div > a {
            display: none !important;
          }
        }
      }
    }
  }
</style>
