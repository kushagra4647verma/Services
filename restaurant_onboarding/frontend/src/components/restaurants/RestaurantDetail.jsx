import { useState } from "react"
import BeverageList from "../beverages/BeverageList"
import EventList from "../events/EventList"
import UploadedFiles from "../common/UploadedFiles"
import FileDropzone from "../common/FileDropzone"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { updateRestaurant } from "../../api/restaurants"
import { Button } from "@/components/ui/button"
import { Store, FileText, Plus, Upload, X } from "lucide-react"

export default function RestaurantDetail({
  restaurant,
  onRestaurantUpdated
}) {
  const [showUploader, setShowUploader] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  async function handleFilesUpdated(newFiles) {
  const updated = await updateRestaurant(restaurant.id, {
    foodMenuPics: newFiles
  })

  onRestaurantUpdated(updated)
}

  async function handleUploadDocuments() {
    if (selectedFiles.length === 0) {
      alert("Please select files")
      return
    }

    try {
      setUploading(true)

      const urls = await uploadRestaurantFiles(
        restaurant.id,
        selectedFiles
      )

      const updated = await updateRestaurant(restaurant.id, {
        foodMenuPics: [
          ...(restaurant.foodMenuPics || []),
          ...urls
        ]
      })

      onRestaurantUpdated(updated)

      // reset UI
      setSelectedFiles([])
      setShowUploader(false)
    } catch (err) {
      console.error(err)
      alert("Failed to upload documents")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Restaurant Header */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl gradient-amber flex items-center justify-center flex-shrink-0">
            <Store className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">{restaurant.name}</h2>
            {restaurant.bio && (
              <p className="text-white/60 mt-2">{restaurant.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Beverages Section */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          🍹 Beverages
        </h3>
        <BeverageList restaurantId={restaurant.id} />
      </div>

      {/* Events Section */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          🎉 Events
        </h3>
        <EventList restaurantId={restaurant.id} />
      </div>

      {/* Documents Section */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Documents
          </h3>
          {!showUploader && (
            <Button
              onClick={() => setShowUploader(true)}
              variant="outline"
              size="sm"
              className="glass border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          )}
        </div>

        {/* SHOW EXISTING FILES */}
        <UploadedFiles
          files={restaurant.foodMenuPics || []}
          restaurantId={restaurant.id}
          onFilesUpdated={handleFilesUpdated}
        />

        {/* DROPZONE + UPLOAD */}
        {showUploader && (
          <div className="mt-4 glass-strong rounded-xl p-4 border border-white/20">
            <FileDropzone
              maxFiles={5}
              onFilesSelected={setSelectedFiles}
            />

            {selectedFiles.length > 0 && (
              <p className="text-white/60 text-sm mt-2">{selectedFiles.length} file(s) selected</p>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploader(false)
                  setSelectedFiles([])
                }}
                className="flex-1 glass border-white/20 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUploadDocuments}
                disabled={uploading}
                className="flex-1 gradient-amber text-black font-semibold hover:opacity-90"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
