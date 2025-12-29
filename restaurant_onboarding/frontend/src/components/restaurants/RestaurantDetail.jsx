import { useState } from "react"
import BeverageList from "../beverages/BeverageList"
import EventList from "../events/EventList"
import UploadedFiles from "../common/UploadedFiles"
import FileDropzone from "../common/FileDropzone"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { updateRestaurant } from "../../api/restaurants"

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
    <>
      <h2>{restaurant.name}</h2>
      <p>{restaurant.bio}</p>

      <BeverageList restaurantId={restaurant.id} />
      <EventList restaurantId={restaurant.id} />

      <div style={{ marginTop: 24 }}>
        <h3>Documents</h3>

        {/* SHOW EXISTING FILES */}
        <UploadedFiles
  files={restaurant.foodMenuPics || []}
  restaurantId={restaurant.id}
  onFilesUpdated={handleFilesUpdated}
/>


        {/* ADD DOCUMENT BUTTON */}
        {!showUploader && (
          <button
            style={{ marginTop: 12 }}
            onClick={() => setShowUploader(true)}
          >
            ➕ Add Document
          </button>
        )}

        {/* DROPZONE + UPLOAD */}
        {showUploader && (
          <div style={{ marginTop: 12 }}>
            <FileDropzone
              maxFiles={5}
              onFilesSelected={setSelectedFiles}
            />

            <button
              onClick={handleUploadDocuments}
              disabled={uploading}
              style={{ marginTop: 8 }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                setShowUploader(false)
                setSelectedFiles([])
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  )
}
