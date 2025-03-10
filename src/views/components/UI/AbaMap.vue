<template>
  <gmap-map
    ref="mapRef"
    :center="latLng"
    :zoom="zoom"
    :options="mapOptions"
    class="aba-map h-x3" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { gmapApi } from 'vue2-google-maps'
import { abaMapStyle, defineABAMarkerClass, getMarkerHtml } from '../../../lib/map'

interface Props {
  center: { lat: number; lng: number }
  zoomRadius?: number
  zoom?: number
  markers?: Array<{ lat: number; lng: number; [key: string]: any }>
}

defineOptions({
  name: 'AbaMapView'
})

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: 52.5220676, lng: 13.4121466 }),
  zoomRadius: 0.12,
  zoom: 17,
  markers: () => []
})

const route = useRoute()
const mapRef = ref<any>(null)
const mapOptions = ref({
  disableDefaultUI: true,
  backgroundColor: '#fff',
  styles: [...abaMapStyle.basic]
})
let CustomMarkerClass: any = null
const markersStock = ref<Record<string, any>>({})
const markerInstances = ref<any[]>([])
const map = ref<any>(null)

const google = computed(() => gmapApi())
const latLng = computed(() => props.center)

const init = async () => {
  if (!mapRef.value) return
  return mapRef.value.$mapPromise.then((mapInstance: any) => {
    map.value = mapInstance
    CustomMarkerClass = defineABAMarkerClass(google.value)
  })
}

const zoomToMarkers = () => {
  if (!markerInstances.value.length) return
  if (markerInstances.value.length === 1) {
    map.value.setCenter(markerInstances.value[0].latLng)
    map.value.setZoom(props.zoom)
  } else {
    const bounds = {
      north: props.center.lat - props.zoomRadius / 6,
      south: props.center.lat + props.zoomRadius / 6,
      west: props.center.lng - props.zoomRadius,
      east: props.center.lng + props.zoomRadius
    }
    map.value.fitBounds(bounds)
  }
}

const clearMarkers = () => {
  markerInstances.value.forEach(m => m.setMap(null))
  markerInstances.value = []
  markersStock.value = {}
}

const setupMarkers = async () => {
  clearMarkers()
  if (!props.markers.length) return
  if (!map.value) {
    await nextTick()
    await init()
  }
  const sortedMarkers = [...props.markers].sort((m1, m2) => {
    const lat1 = typeof m1.lat === 'string' ? parseFloat(m1.lat) : m1.lat
    const lat2 = typeof m2.lat === 'string' ? parseFloat(m2.lat) : m2.lat
    return lat1 - lat2
  })
  sortedMarkers.forEach(mData => {
    const markerData = { ...mData }
    const markerElement = getMarkerHtml(markerData, mapRef.value.$el, markersStock.value)
    if (markerElement && CustomMarkerClass && map.value) {
      const { lat, lng } = mData
      const marker = new CustomMarkerClass({ lat, lng }, markerElement)
      marker.setMap(map.value)
      markerInstances.value.push(marker)
    }
  })
  zoomToMarkers()
}

onMounted(async () => {
  if (mapRef.value) {
    await init()
    if (props.markers.length) {
      setupMarkers()
    }
  }
})

watch(() => props.markers, () => {
  setupMarkers()
})

watch(() => route.path, () => {
  setupMarkers()
})
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
