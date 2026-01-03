import { useState } from "react"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { getCurrentLocation } from "../../utils/getCurrentLocation"
import { updateRestaurant } from "../../api/restaurants"
import FileDropzone from "../common/FileDropzone"
import MapPicker from "../common/MapPicker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Store, FileText, MapPin, Upload, X } from "lucide-react"

export default function RestaurantForm({
  onCreate,
  onRestaurantUpdated,
  onCancel
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
    <div className="space-y-5">
      {/* Restaurant Name */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-500" />
          Restaurant Name *
        </label>
        <Input
          placeholder="Enter restaurant name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-12"
        />
      </div>

      {/* Bio/Description */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          Description
        </label>
        <Textarea
          placeholder="Tell us about your restaurant..."
          value={bio}
          onChange={e => setBio(e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
        />
      </div>

      {/* Location Picker */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-500" />
          Location
        </label>
        <div className="glass rounded-xl p-3 border border-white/20">
          <MapPicker
            value={location}
            onChange={setLocation}
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-500" />
          Menu / Documents
        </label>
        <div className="glass rounded-xl p-4 border border-white/20">
          <FileDropzone
            maxFiles={5}
            onFilesSelected={files => setSelectedFiles(files)}
          />
          {selectedFiles.length > 0 && (
            <div className="mt-3 text-sm text-white/60">
              {selectedFiles.length} file(s) selected
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 glass border-white/20 text-white h-12 rounded-xl hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className={`${onCancel ? 'flex-1' : 'w-full'} gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90 transition-opacity`}
        >
          {loading ? "Creating..." : "Create Restaurant"}
        </Button>
      </div>
    </div>
  )
}
