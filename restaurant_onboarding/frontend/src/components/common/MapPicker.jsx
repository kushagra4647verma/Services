import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
})

function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    }
  })

  return position ? <Marker position={position} /> : null
}

export default function MapPicker({ value, onChange }) {
  // Default to Bangalore if no value provided
  const defaultCenter = { lat: 12.9716, lng: 77.5946 }
  
  // Ensure center is always valid
  const center = (value && value.lat && value.lng) ? value : defaultCenter

  return (
    <div style={{ height: "300px", marginTop: "10px" }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker 
          position={value && value.lat && value.lng ? [value.lat, value.lng] : null} 
          onChange={onChange} 
        />
      </MapContainer>
    </div>
  )
}
