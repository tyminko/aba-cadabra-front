// ABA Map styles and utilities
export const abaMapStyle = {
  basic: [
    {
      featureType: 'all',
      elementType: 'geometry.fill',
      stylers: [{ weight: '2.00' }]
    },
    {
      featureType: 'all',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#9c9c9c' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text',
      stylers: [{ visibility: 'on' }]
    },
    {
      featureType: 'landscape',
      elementType: 'all',
      stylers: [{ color: '#f2f2f2' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [{ saturation: -100 }, { lightness: 45 }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: '#eeeeee' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#7b7b7b' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'all',
      stylers: [{ visibility: 'simplified' }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#c8d7d4' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#070707' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#ffffff' }]
    }
  ]
}

export const mapOptions = {
  disableDefaultUI: true,
  backgroundColor: '#fff',
  styles: [...abaMapStyle.basic]
}

export function getMarkerHtml (markerData, mapEl, markerStock) {
  if (markerData.lat === '' || markerData.lng === '') return null
  // const mapEl = document.getElementById('map')
  let markerEl, toReturn
  const markerKey = 'm' + markerData.lat + markerData.lng

  if (markerStock && markerStock.hasOwnProperty(markerKey)) {
    markerEl = markerStock[markerKey]
    toReturn = null
  } else {
    markerEl = document.createElement('div')
    markerEl.className = 'aba-marker'
    markerEl.style.zIndex = markerData.lat
    mapEl.insertAdjacentElement('afterend', markerEl)
    markerStock[markerKey] = markerEl
    toReturn = markerEl
  }
  const activeClass = markerData.active ? 'active' : ''
  if (activeClass) {
    markerEl.classList.add(activeClass)
  }
  if (markerData.label) {
    const label = '<a href="' + markerData.url + '" class="label ' + activeClass + '">' + markerData.label + '</a>'
    markerEl.insertAdjacentHTML('beforeend', label)
  }
  return toReturn
}

export function markersBounds (google, markersInstances) {
  const bounds = new google.maps.LatLngBounds()
  markersInstances.forEach(marker => {
    bounds.extend(marker.latLng)
  })
  return bounds
}

export function defineABAMarkerClass (google) {
  /**
   * A customized popup on the map.
   * @param {!google.maps.LatLng} position
   * @param {!Element} content
   * @constructor
   * @extends {google.maps.OverlayView}
   */
  const ABAMarker = function (position, content) {
    // this.position = position
    this.position = new google.maps.LatLng(position.lat, position.lng)
    this.latLng = position
    content.classList.add('popup-bubble-content')

    const pixelOffset = document.createElement('div')
    pixelOffset.classList.add('popup-bubble-anchor')
    pixelOffset.appendChild(content)
    if (content.classList.contains('active')) pixelOffset.classList.add('active')

    this.anchor = document.createElement('div')
    this.anchor.classList.add('popup-tip-anchor')
    this.anchor.style.zIndex = Math.floor((1 - position.lat / 100) * 1000000)
    this.anchor.appendChild(pixelOffset)

    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation()
  }

  // NOTE: google.maps.OverlayView is only defined once the Maps API has
  // loaded. That is why ABAMarker is defined inside initMap().
  ABAMarker.prototype = Object.create(google.maps.OverlayView.prototype)

  /** Called when the popup is added to the map. */
  ABAMarker.prototype.onAdd = function () {
    this.getPanes().floatPane.appendChild(this.anchor)
  }

  /** Called when the popup is removed from the map. */
  ABAMarker.prototype.onRemove = function () {
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor)
    }
  }

  /** Called when the popup needs to draw itself. */
  ABAMarker.prototype.draw = function () {
    const divPosition = this.getProjection().fromLatLngToDivPixel(this.position)
    // Hide the popup when it is far out of view.
    const display =
      Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
        ? 'block'
        : 'none'

    if (display === 'block') {
      this.anchor.style.left = divPosition.x + 'px'
      this.anchor.style.top = divPosition.y + 'px'
    }
    if (this.anchor.style.display !== display) {
      this.anchor.style.display = display
    }
  }

  /** Stops clicks/drags from bubbling up to the map. */
  ABAMarker.prototype.stopEventPropagation = function () {
    var anchor = this.anchor
    anchor.style.cursor = 'auto';

    ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
      'pointerdown']
      .forEach(function (event) {
        anchor.addEventListener(event, function (e) {
          e.stopPropagation()
        })
      })
  }

  return ABAMarker
}
