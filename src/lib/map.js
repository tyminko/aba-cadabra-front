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
