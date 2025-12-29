import { useState } from "react"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { getCurrentLocation } from "../../utils/getCurrentLocation"
import { updateRestaurant } from "../../api/restaurants"
import FileDropzone from "../common/FileDropzone"
import MapPicker from "../common/MapPicker"

export default function RestaurantForm({
  onCreate,
  onRestaurantUpdated
}) {

  if (typeof onCreate !== "function") {
    throw new Error("RestaurantForm requires onCreate prop")
  }

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([]) // ✅ array
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)

  async function handleSubmit() {
    if (!name.trim()) {
      alert("Restaurant name is required")
      return
    }

    if (loading) return
    setLoading(true)

    try {
      const finalLocation =
  location || (await getCurrentLocation())


      const restaurant = await onCreate({
        name,
        bio,
        location: finalLocation
      })
      let finalRestaurant = restaurant;
      if (selectedFiles.length > 0) {
        const urls = await uploadRestaurantFiles(
  restaurant.id,
  selectedFiles
)

finalRestaurant = await updateRestaurant(restaurant.id, {
  foodMenuPics: urls
})

// 🔥 IMPORTANT: return updated restaurant
// return updated

      }
      console.log("updated restaurant", finalRestaurant);
      console.log("typeof finalRestaurant:", typeof finalRestaurant)

      onRestaurantUpdated(finalRestaurant)

      // Reset form
      setName("")
      setBio("")
      setSelectedFiles([])
    } catch (err) {
      console.error(err)
      alert("Failed to save restaurant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input
        placeholder="Restaurant name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <textarea
        placeholder="Bio"
        value={bio}
        onChange={e => setBio(e.target.value)}
      />
      <MapPicker
  value={location}
  onChange={setLocation}
/>

      <FileDropzone
        maxFiles={5}
        onFilesSelected={files => setSelectedFiles(files)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Save & Continue"}
      </button>
    </>
  )
}
