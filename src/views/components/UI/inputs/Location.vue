<template>
  <div class="location">
    <SearchInput
      v-model="searchQuery"
      :results="searchResults"
      placeholder="Search location..."
      @update:modelValue="queryLocation" />
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

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { gmapApi } from 'vue2-google-maps'
import type { Ref } from 'vue'
import PxInput from './PxInput.vue'
import { abaMapStyle, defineABAMarkerClass, getMarkerHtml } from '../../../../lib/map'
import SearchInput from './SearchInput.vue'

declare global {
  interface Window {
    google: {
      maps: {
        Geocoder: new () => any;
        [key: string]: any;
      };
    };
  }
}

interface LocationValue {
  id?: string
  address?: string
  country?: string
  countryCode?: string
  latLng?: { lat: number; lng: number }
  lat?: number
  lng?: number
}

interface LatLng {
  lat: number
  lng: number
}

interface SearchResult {
  id: string
  text: string
  label: string
}

defineOptions({
  name: 'LocationInput'
})

const props = withDefault(defineProps<{
  value: LocationValue
}>(), {
  value: () => ({})
})

const emit = defineEmits<{
  (e: 'input', value: LocationValue): void
}>()

const locationObj = ref<LocationValue | null>(null)
const geocoder = ref<any>(null)
const tmpAddress = ref('')
const tmpLatLng = ref<LatLng | null>(null)
const defaultLatLng: LatLng = { lat: 52.5220676, lng: 13.4121466 }
const mapOptions = {
  disableDefaultUI: true,
  backgroundColor: '#fff',
  styles: [...abaMapStyle.basic]
}
const MarkerClass = ref<any>(null)
const markerEl = ref<HTMLElement | null>(null)
const markerInstance = ref<any>(null)
const markersStock = ref<Record<string, any>>({})
const map = ref<any>(null)
const error = ref<string | null>(null)
const searchResults = ref<SearchResult[]>([])
const searchQuery = ref('')

const googleMaps = computed(() => {
  const api = gmapApi ()
  return api?.map
})

const address = computed({
  get () { return tmpAddress.value || props.value.address },
  async set(newValue) {
    // !!! DEBUG !!!
    console.log('%c address.set () %c newValue: ', 'background:#ffbbff;color:#000', 'color:#00aaff', newValue)
    tmpAddress.value = newValue
    if (!newValue) {
      latLng.value = null
    } else {
      const location = await addressToLocation(newValue)
      // !!! DEBUG !!!
      console.log('%c set () %c location: ', 'background:#ffbb00;color:#000', 'color:#00aaff', location)
      if (location === props.value) return
      // !!! DEBUG !!!
      console.log('%c address.set () %c location: ', 'background:#ffbb00;color:#000', 'color:#00aaff', location)
      latLng.value = (location as LocationValue)?.latLng || null
      tmpAddress.value = (location as LocationValue)?.address || ''
      setMarker((location as LocationValue)?.latLng)
      emit('input', location as LocationValue)
    }
  }
})

const latLng = computed({
  get () {
    if (tmpLatLng.value) return tmpLatLng.value
    // !!! DEBUG !!!
    console.log('%c get () %c this.value: ', 'background:#ffbb00;color:#000', 'color:#00aaff', props.value)
    const { lat, lng } = props.value || {}
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
  },
  set(newValue) {
    tmpLatLng.value = newValue
  }
})

const queryLocation = () => {}

const round = (n) => {
  return Math.round(n * 1000) / 1000
}

const init = async () => {
  if (map.value) {
    await map.value.$mapPromise.then(map => {
      map.value = map
      MarkerClass.value = defineABAMarkerClas(googleMaps.value)
    })
  }
}

const addressToLocation = async (addressStr) => {
  // !!! DEBUG !!!
  console.log('%c addressToLocation () %c this.value.address: ', 'background:#ffbbff;color:#000', 'color:#00aaff', props.value.address)
  if (!addressStr) return null
  if (addressStr === props.value.address) return props.value
  if (!geocoder.value) geocoder.value = new googleMaps.value.maps.Geocoder ()
  return new Promise((resolve) => {
    geocoder.value.geocode({ address: addressStr }, async (results, status) => {
      if (status === 'OK') {
        const res = results[0]
        const location = res.geometry.location
        const latLng = { lat: location.lat (), lng: location.lng () }

        // !!! DEBUG !!!
        console.log('%c () %c res: ', 'background:#00ddff;color:#000', 'color:#00aaff', res)

        resolve({
          id: res.place_id,
          address: res.formatted_address,
          country: (res.address_components.find(c => c.types.include('locality')) || {}).long_name,
          countryCode: (res.address_components.find(c => c.types.include('locality')) || {}).short_name,
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
}

const setMarker = async (location) => {
  if (!location) return
  if (!map.value) {
    await nextTick ()
    await init ()
  }
  if (!markerEl.value && map.value) {
    markerEl.value = getMarkerHtml({ ...location, active: true }, map.value.$el, markersStock.value)
  }
  // !!! DEBUG !!!
  console.log('%c setMarker () %c this.map: ', 'background:#00bbff;color:#000', 'color:#00aaff', map.value)
  console.log('%c setMarker () %c this.markerEl: ', 'background:#00bbff;color:#000', 'color:#00aaff', markerEl.value)
  console.log('%c setMarker () %c this.MarkerClass: ', 'background:#00bbff;color:#000', 'color:#00aaff', MarkerClass.value)

  if (markerInstance.value &&
    markerInstance.value.latLng.lat !== location.lat &&
    markerInstance.value.latLng.lng !== location.lng
  ) {
    markerInstance.value.setMap(null)
  }
  if (markerEl.value && MarkerClass.value && map.value) {
    // noinspection JSClosureCompilerSyntax
    markerInstance.value = new MarkerClass.value(location, markerEl.value)
    markerInstance.value.setMap(map.value)
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
