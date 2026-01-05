import { useState, useEffect } from "react"
import BeverageList from "../beverages/BeverageList"
import EventList from "../events/EventList"
import UploadedFiles from "../common/UploadedFiles"
import FileDropzone from "../common/FileDropzone"
import RestaurantForm from "./RestaurantForm"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { updateRestaurant, getLegalInfo, getBankDetails } from "../../api/restaurants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Store, FileText, Plus, Upload, X, Edit2, MapPin, Phone,
  Link2, Clock, DollarSign, Image, ExternalLink
} from "lucide-react"

// Convert database integer to display string
function formatPriceRange(value) {
  const map = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" }
  return map[value] || value
}

export default function RestaurantDetail({
  restaurant,
  onRestaurantUpdated
}) {
  const [showUploader, setShowUploader] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [legalInfo, setLegalInfo] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [loadingExtra, setLoadingExtra] = useState(false)

  // Load legal and bank info when opening edit modal
  useEffect(() => {
    if (showEditModal && restaurant?.id) {
      loadExtraInfo()
    }
  }, [showEditModal, restaurant?.id])

  async function loadExtraInfo() {
    setLoadingExtra(true)
    try {
      const [legal, bank] = await Promise.all([
        getLegalInfo(restaurant.id).catch(() => null),
        getBankDetails(restaurant.id).catch(() => null)
      ])
      setLegalInfo(legal)
      setBankDetails(bank)
    } catch (err) {
      console.error("Failed to load extra info:", err)
    } finally {
      setLoadingExtra(false)
    }
  }

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

      setSelectedFiles([])
      setShowUploader(false)
    } catch (err) {
      console.error(err)
      alert("Failed to upload documents")
    } finally {
      setUploading(false)
    }
  }

  function handleEditComplete(updatedRestaurant) {
    onRestaurantUpdated(updatedRestaurant)
  }

  return (
    <div className="space-y-6">
      {/* Restaurant Header with Cover */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        {/* Cover Image */}
        {restaurant.coverImage && (
          <div className="h-40 w-full relative">
            <img
              src={restaurant.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo or Icon */}
            {restaurant.logoImage ? (
              <img
                src={restaurant.logoImage}
                alt="Logo"
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl gradient-amber flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-black" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-white text-2xl font-bold truncate">{restaurant.name}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-amber-400 hover:bg-amber-500/20 flex-shrink-0"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              {restaurant.bio && (
                <p className="text-white/60 mt-1 line-clamp-2">{restaurant.bio}</p>
              )}

              {/* Quick Info Row */}
              <div className="flex flex-wrap gap-3 mt-3">
                {restaurant.phone && (
                  <span className="text-white/50 text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {restaurant.phone}
                  </span>
                )}
                {restaurant.priceRange && (
                  <span className="text-amber-400 text-sm flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {formatPriceRange(restaurant.priceRange)}
                  </span>
                )}
                {restaurant.hasReservation && (
                  <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                    Reservations
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          {(restaurant.cuisineTags?.length > 0 || restaurant.amenities?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              {restaurant.cuisineTags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {restaurant.cuisineTags.map(tag => (
                    <Badge key={tag} className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {restaurant.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {restaurant.amenities.map(amenity => (
                    <Badge key={amenity} variant="outline" className="border-white/20 text-white/60 text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {(restaurant.instaLink || restaurant.facebookLink || restaurant.twitterLink || restaurant.googleMapsLink) && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {restaurant.instaLink && (
                <a href={restaurant.instaLink} target="_blank" rel="noopener noreferrer"
                   className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1">
                  📸 Instagram <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {restaurant.facebookLink && (
                <a href={restaurant.facebookLink} target="_blank" rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  📘 Facebook <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {restaurant.twitterLink && (
                <a href={restaurant.twitterLink} target="_blank" rel="noopener noreferrer"
                   className="text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1">
                  🐦 Twitter <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {restaurant.googleMapsLink && (
                <a href={restaurant.googleMapsLink} target="_blank" rel="noopener noreferrer"
                   className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1">
                  📍 Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Opening Hours */}
          {restaurant.openingHours && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-white/60 text-sm whitespace-pre-line">{restaurant.openingHours}</p>
              </div>
            </div>
          )}

          {/* Address */}
          {restaurant.address && (
            <div className="mt-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-white/60 text-sm">{restaurant.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      {restaurant.gallery?.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-500" />
            Gallery
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {restaurant.gallery.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-colors"
              >
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

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

        <UploadedFiles
          files={restaurant.foodMenuPics || []}
          restaurantId={restaurant.id}
          onFilesUpdated={handleFilesUpdated}
        />

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

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="glass-strong border-white/20 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              Edit Restaurant
            </DialogTitle>
          </DialogHeader>

          {loadingExtra ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <RestaurantForm
                editRestaurant={restaurant}
                editLegalInfo={legalInfo}
                editBankDetails={bankDetails}
                onRestaurantUpdated={handleEditComplete}
                onComplete={() => setShowEditModal(false)}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
