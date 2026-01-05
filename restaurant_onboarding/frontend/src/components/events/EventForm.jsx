import { useState } from "react"
import { createEvent, updateEvent } from "../../api/events"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { deleteStorageFile } from "../../utils/deleteStorageFiles"
import FileDropzone from "../common/FileDropzone"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, X, Clock, Link, FileText, Image, Trash2, RefreshCw, ExternalLink } from "lucide-react"

export default function EventForm({ restaurantId, onCreate, onCancel, initialData = null }) {
  const isEditing = !!initialData?.id
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    eventDate: initialData?.eventDate || "",
    eventTime: initialData?.eventTime || "",
    bookingLink: initialData?.bookingLink || "",
    description: initialData?.description || "",
    photo: initialData?.photo || "",
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  function updateField(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function submit() {
    if (!formData.name.trim()) return
    
    setLoading(true)
    try {
      // Upload image if selected
      let photoUrl = formData.photo || null
      if (selectedFile) {
        const urls = await uploadRestaurantFiles(restaurantId, [selectedFile])
        photoUrl = urls[0]
      }

      const payload = {
        ...formData,
        photo: photoUrl
      }

      let event
      if (isEditing) {
        event = await updateEvent(initialData.id, payload)
      } else {
        event = await createEvent(restaurantId, payload)
      }
      onCreate(event)
      // Reset form
      setFormData({
        name: "", eventDate: "", eventTime: "",
        bookingLink: "", description: "", photo: ""
      })
      setSelectedFile(null)
    } catch (err) {
      console.error(err)
      alert(isEditing ? "Failed to update event" : "Failed to add event")
    } finally {
      setLoading(false)
    }
  }

  // Cover image handlers
  async function handleDeleteCoverImage() {
    if (!formData.photo) return
    const ok = window.confirm("Delete this cover image permanently?")
    if (!ok) return
    try {
      await deleteStorageFile(formData.photo)
      setFormData(prev => ({ ...prev, photo: "" }))
    } catch (err) {
      console.error(err)
      alert("Failed to delete image")
    }
  }

  async function handleReplaceCoverImage(newFile) {
    if (!newFile) return
    try {
      if (formData.photo) {
        await deleteStorageFile(formData.photo)
      }
      const [newUrl] = await uploadRestaurantFiles(restaurantId, [newFile])
      setFormData(prev => ({ ...prev, photo: newUrl }))
    } catch (err) {
      console.error(err)
      alert("Failed to replace image")
    }
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 w-full">
      {/* Name */}
      <div className="w-full">
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          Event Name *
        </label>
        <Input
          placeholder="Enter event name"
          value={formData.name}
          onChange={e => updateField("name", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-12"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Image className="w-4 h-4 text-purple-500" />
          Cover Image
        </label>
        {formData.photo ? (
          <div className="glass rounded-xl overflow-hidden">
            <div className="relative h-40">
              <img
                src={formData.photo}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-3 space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleDeleteCoverImage}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 glass border-white/20 text-red-400 text-xs hover:bg-red-500/20 hover:border-red-500/50"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
                <label className="flex-1">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full h-8 glass border-white/20 text-white text-xs hover:bg-purple-500/20 hover:border-purple-500/50 cursor-pointer"
                  >
                    <span>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Replace
                    </span>
                  </Button>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files[0]) {
                        handleReplaceCoverImage(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>
              <a
                href={formData.photo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-purple-500/80 hover:text-purple-500 text-xs transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Open
              </a>
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl p-3 border border-white/20">
            <FileDropzone
              maxFiles={1}
              onFilesSelected={files => setSelectedFile(files[0] || null)}
            />
          </div>
        )}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Event Date
          </label>
          <Input
            type="date"
            value={formData.eventDate}
            onChange={e => updateField("eventDate", e.target.value)}
            className="glass border-white/20 text-white h-10 [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            Event Time
          </label>
          <Input
            type="time"
            value={formData.eventTime}
            onChange={e => updateField("eventTime", e.target.value)}
            className="glass border-white/20 text-white h-10 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Booking Link */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Link className="w-4 h-4 text-purple-500" />
          Booking / RSVP Link
        </label>
        <Input
          placeholder="https://..."
          value={formData.bookingLink}
          onChange={e => updateField("bookingLink", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-10"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-500" />
          Description
        </label>
        <Textarea
          placeholder="Describe this event..."
          value={formData.description}
          onChange={e => updateField("description", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 glass border-white/20 text-white h-11 rounded-xl hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          onClick={submit}
          disabled={loading || !formData.name.trim()}
          className={`${onCancel ? 'flex-1' : 'w-full'} gradient-purple text-white font-semibold h-11 rounded-xl hover:opacity-90`}
        >
          {loading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Event")}
        </Button>
      </div>
    </div>
  )
}
