import { useState, useCallback, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Locate, Loader2 } from "lucide-react"

// Fix for default marker icons in Leaflet with webpack/vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Default to Goa, India
const defaultCenter = { lat: 15.4909, lng: 73.8278 }

/**
 * Parse WKB hex format to {lat, lng}
 * Format: 0101000020E6100000[lng 8 bytes][lat 8 bytes]
 */
function parseWkbHexToLatLng(wkbHex) {
  if (!wkbHex || typeof wkbHex !== "string") return null
  
  // If it's already a valid lat/lng object, return it
  if (typeof wkbHex === "object" && wkbHex.lat && wkbHex.lng) {
    return wkbHex
  }
  
  try {
    // WKB Point with SRID format:
    // 01 - little endian
    // 01000020 - Point type with SRID flag
    // E6100000 - SRID 4326
    // Then 16 bytes (32 hex chars) for lng (8 bytes) + lat (8 bytes)
    
    // The coordinates start at position 18 (after the header)
    const coordsHex = wkbHex.substring(18)
    
    if (coordsHex.length < 32) return null
    
    // Parse little-endian doubles
    const lngHex = coordsHex.substring(0, 16)
    const latHex = coordsHex.substring(16, 32)
    
    const lng = parseHexToDouble(lngHex)
    const lat = parseHexToDouble(latHex)
    
    if (isNaN(lat) || isNaN(lng)) return null
    
    return { lat, lng }
  } catch (e) {
    console.error("Error parsing WKB:", e)
    return null
  }
}

/**
 * Parse 16-char hex string to IEEE 754 double (little-endian)
 */
function parseHexToDouble(hex) {
  // Convert hex pairs to bytes (little-endian)
  const bytes = []
  for (let i = 0; i < 16; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  
  // Create a buffer and read as float64 little-endian
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  bytes.forEach((b, i) => view.setUint8(i, b))
  
  return view.getFloat64(0, true) // true = little-endian
}

/**
 * Normalize location value - handles both WKB hex strings and {lat, lng} objects
 */
function normalizeLocation(value) {
  if (!value) return null
  
  // If it's already a valid lat/lng object
  if (typeof value === "object" && typeof value.lat === "number" && typeof value.lng === "number") {
    return value
  }
  
  // If it's a WKB hex string
  if (typeof value === "string") {
    return parseWkbHexToLatLng(value)
  }
  
  return null
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Component to pan map to location
function MapPanHandler({ location }) {
  const map = useMap()
  
  useEffect(() => {
    if (location?.lat && location?.lng) {
      map.setView([location.lat, location.lng], 16)
    }
  }, [map, location?.lat, location?.lng])
  
  return null
}

// Draggable marker component
function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null)
  
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current
      if (marker) {
        const latlng = marker.getLatLng()
        onDragEnd({ lat: latlng.lat, lng: latlng.lng })
      }
    },
  }
  
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
    />
  )
}

export default function MapPicker({ value, onChange }) {
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [mapKey, setMapKey] = useState(0) // Force re-render when needed
  
  // Normalize the incoming value (handle WKB hex strings)
  const normalizedValue = normalizeLocation(value)
  
  // Get center - use normalized value if valid, otherwise default
  const center = normalizedValue?.lat && normalizedValue?.lng ? normalizedValue : defaultCenter

  // Handle "Use Current Location" button
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        onChange(newLocation)
        setMapKey(k => k + 1) // Force map re-render to pan
        setLoadingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Unable to get your location. Please enable location access.")
        setLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onChange])

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Click on the map to set location</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Locate className="w-4 h-4 mr-2" />
          )}
          Use Current Location
        </Button>
      </div>
      
      <div className="h-[300px] rounded-lg overflow-hidden border border-white/20">
        <MapContainer
          key={mapKey}
          center={[center.lat, center.lng]}
          zoom={normalizedValue?.lat ? 16 : 13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onChange} />
          <MapPanHandler location={normalizedValue} />
          {normalizedValue?.lat && normalizedValue?.lng && (
            <DraggableMarker 
              position={normalizedValue} 
              onDragEnd={onChange}
            />
          )}
        </MapContainer>
      </div>
      
      {normalizedValue?.lat && normalizedValue?.lng && (
        <p className="text-xs text-muted-foreground">
          Selected: {normalizedValue.lat.toFixed(6)}, {normalizedValue.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}