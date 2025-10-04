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

export const abaMapStyle = {
  basic: [
    {
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#f5f5f5'
        }
      ]
    },
    {
      'elementType': 'labels.icon',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#616161'
        }
      ]
    },
    {
      'elementType': 'labels.text.stroke',
      'stylers': [
        {
          'color': '#f5f5f5'
        }
      ]
    },
    {
      'featureType': 'administrative.land_parcel',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#bdbdbd'
        }
      ]
    },
    {
      'featureType': 'landscape.man_made',
      'elementType': 'geometry.stroke',
      'stylers': [
        {
          'color': '#999999'
        },
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#eeeeee'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#757575'
        }
      ]
    },
    {
      'featureType': 'poi.park',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#e5e5e5'
        }
      ]
    },
    {
      'featureType': 'poi.park',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#9e9e9e'
        }
      ]
    },
    {
      'featureType': 'road',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#ffffff'
        }
      ]
    },
    {
      'featureType': 'road.arterial',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#757575'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#dadada'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#616161'
        }
      ]
    },
    {
      'featureType': 'road.local',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#9e9e9e'
        }
      ]
    },
    {
      'featureType': 'transit.line',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#e5e5e5'
        }
      ]
    },
    {
      'featureType': 'transit.station',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#eeeeee'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#c9c9c9'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#9e9e9e'
        }
      ]
    }
  ],
  simpleLabelsWithRoads: [
    {
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#ffffff'
        }
      ]
    },
    {
      'elementType': 'labels',
      'stylers': [
        {
          'visibility': 'simplified'
        }
      ]
    },
    {
      'elementType': 'labels.icon',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#2f2f2f'
        }
      ]
    },
    {
      'elementType': 'labels.text.stroke',
      'stylers': [
        {
          'color': '#ffffff'
        }
      ]
    },
    {
      'featureType': 'administrative.land_parcel',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#bdbdbd'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#f9f9f9'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#757575'
        }
      ]
    },
    {
      'featureType': 'poi.park',
      'elementType': 'labels',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road.arterial',
      'elementType': 'geometry.fill',
      'stylers': [
        {
          'color': '#dfdfdf'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#dadada'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'labels.text',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#616161'
        }
      ]
    },
    {
      'featureType': 'road.highway.controlled_access',
      'elementType': 'geometry.stroke',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road.local',
      'elementType': 'geometry.fill',
      'stylers': [
        {
          'color': '#d1d1d1'
        }
      ]
    },
    {
      'featureType': 'transit.station',
      'elementType': 'geometry',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#dbdbdb'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    }
  ],
  noLabels: [
    {
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#ffffff'
        }
      ]
    },
    {
      'elementType': 'labels',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'elementType': 'labels.icon',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#2f2f2f'
        }
      ]
    },
    {
      'elementType': 'labels.text.stroke',
      'stylers': [
        {
          'color': '#ffffff'
        }
      ]
    },
    {
      'featureType': 'administrative.land_parcel',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#bdbdbd'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#f9f9f9'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#757575'
        }
      ]
    },
    {
      'featureType': 'poi.park',
      'elementType': 'labels',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road.arterial',
      'elementType': 'geometry.fill',
      'stylers': [
        {
          'color': '#dfdfdf'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#dadada'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'labels.text',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road.highway',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'color': '#616161'
        }
      ]
    },
    {
      'featureType': 'road.highway.controlled_access',
      'elementType': 'geometry.stroke',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road.local',
      'elementType': 'geometry.fill',
      'stylers': [
        {
          'color': '#d1d1d1'
        }
      ]
    },
    {
      'featureType': 'transit.line',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#dcdcdc'
        }
      ]
    },
    {
      'featureType': 'transit.station',
      'elementType': 'geometry',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'geometry',
      'stylers': [
        {
          'color': '#cbcbcb'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'labels.text.fill',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    }
  ]
}

// Define ABA marker class
export function defineABAMarkerClass (google) {
  // Custom marker implementation using Google Maps OverlayView
  return class ABAMarker extends google.maps.OverlayView {
    constructor (position, markerEl) {
      super()
      this.position = position
      this.markerEl = markerEl
      this.div = null
      console.log('ABAMarker constructor called with:', { position, markerEl }) // Debug log
    }

    onAdd () {
      console.log('ABAMarker onAdd called, markerEl:', this.markerEl) // Debug log
      this.div = document.createElement('div')
      this.div.style.position = 'absolute'
      this.div.innerHTML = this.markerEl
      this.div.style.cursor = 'pointer'

      const panes = this.getPanes()
      if (panes && panes.overlayMouseTarget) {
        panes.overlayMouseTarget.appendChild(this.div)
        console.log('ABAMarker div created and appended:', this.div) // Debug log
      } else {
        console.error('ABAMarker: Could not get panes or overlayMouseTarget') // Debug log
      }
    }

    draw () {
      console.log('ABAMarker draw called, div:', this.div) // Debug log
      const overlayProjection = this.getProjection()
      const position = overlayProjection.fromLatLngToDivPixel(this.position)

      if (this.div) {
        this.div.style.left = position.x - 10 + 'px'
        this.div.style.top = position.y - 10 + 'px'
        console.log('ABAMarker positioned at:', position) // Debug log
      } else {
        console.error('ABAMarker draw: div is null') // Debug log
      }
    }

    onRemove () {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div)
        this.div = null
      }
    }

    getPosition () {
      return this.position
    }

    getDiv () {
      console.log('ABAMarker getDiv called, returning:', this.div) // Debug log
      return this.div
    }
  }
}

// Get marker HTML
export function getMarkerHtml (markerData, mapEl, markersStock, markerId) {
  // Use provided markerId or generate one if not provided
  const finalMarkerId = markerId || markerData.id || `marker-${Date.now()}-${Math.random()}`
  console.log('getMarkerHtml called with markerId:', markerId, 'finalMarkerId:', finalMarkerId) // Debug log

  // Get event number from various possible fields
  let eventNumber = markerData.countNumber ||
                   markerData.label ||
                   markerData.eventNumber ||
                   markerData.number ||
                   markerData.id ||
                   '?'

  const html = `
    <div class="popup-tip-anchor" data-marker-id="${finalMarkerId}">
      <div class="popup-bubble-anchor">
        <div class="popup-bubble-content">
          <div class="label">${eventNumber}</div>
        </div>
      </div>
    </div>
  `
  console.log('getMarkerHtml returning:', html) // Debug log
  return html
}
