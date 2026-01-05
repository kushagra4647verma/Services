import { useState, useCallback, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Locate, Loader2 } from "lucide-react"

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px"
}

// Default to Bangalore
const defaultCenter = { lat: 12.9716, lng: 77.5946 }

export default function MapPicker({ value, onChange }) {
  const [map, setMap] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    // Add libraries if needed: libraries: ["places"]
  })

  // Get center - use value if valid, otherwise default
  const center = value?.lat && value?.lng ? value : defaultCenter

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Handle map click to set marker
  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    onChange({ lat, lng })
  }, [onChange])

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
        // Pan map to new location
        if (map) {
          map.panTo(newLocation)
          map.setZoom(16)
        }
        setLoadingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Unable to get your location. Please enable location access.")
        setLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onChange, map])

  // When editing, pan to the saved location
  useEffect(() => {
    if (map && value?.lat && value?.lng) {
      map.panTo({ lat: value.lat, lng: value.lng })
    }
  }, [map, value?.lat, value?.lng])

  if (loadError) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-red-500">Error loading Google Maps. Check your API key.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading map...</span>
      </div>
    )
  }

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
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={value?.lat ? 16 : 13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {value?.lat && value?.lng && (
          <Marker 
            position={{ lat: value.lat, lng: value.lng }}
            draggable={true}
            onDragEnd={(e) => {
              onChange({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              })
            }}
          />
        )}
      </GoogleMap>
      
      {value?.lat && value?.lng && (
        <p className="text-xs text-muted-foreground">
          Selected: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}
