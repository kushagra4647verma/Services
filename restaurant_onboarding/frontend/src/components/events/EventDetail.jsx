import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getEvents, updateEvent, deleteEvent } from "../../api/events"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { deleteStorageFile } from "../../utils/deleteStorageFiles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft, Calendar, Edit, Trash2, Clock, Link, FileText, Image, ExternalLink, RefreshCw
} from "lucide-react"

export default function EventDetail({ restaurantId }) {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [eventId, restaurantId])

  async function loadEvent() {
    if (!restaurantId || !eventId) return
    setLoading(true)
    try {
      const events = await getEvents(restaurantId)
      const found = events.find(e => e.id === eventId)
      setEvent(found || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openEditModal() {
    setEditData({
      name: event.name || "",
      photo: event.photo || "",
      eventDate: event.eventDate || "",
      eventTime: event.eventTime || "",
      bookingLink: event.bookingLink || "",
      description: event.description || "",
    })
    setShowEditModal(true)
  }

  function updateField(field, value) {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateEvent(eventId, {
        ...editData,
        photo: editData.photo || null
      })
      setEvent(updated)
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
      alert("Failed to update event")
    } finally {
      setSaving(false)
    }
  }

  // Cover image handlers
  async function handleDeleteCoverImage() {
    if (!editData.photo) return
    const ok = window.confirm("Delete this cover image permanently?")
    if (!ok) return
    try {
      await deleteStorageFile(editData.photo)
      setEditData(prev => ({ ...prev, photo: "" }))
    } catch (err) {
      console.error(err)
      alert("Failed to delete image")
    }
  }

  async function handleReplaceCoverImage(newFile) {
    if (!newFile) return
    try {
      // Delete old image if exists
      if (editData.photo) {
        await deleteStorageFile(editData.photo)
      }
      // Upload new image
      const [newUrl] = await uploadRestaurantFiles(restaurantId, [newFile])
      setEditData(prev => ({ ...prev, photo: newUrl }))
    } catch (err) {
      console.error(err)
      alert("Failed to replace image")
    }
  }

  async function handleUploadNewCoverImage(file) {
    if (!file) return
    try {
      const [newUrl] = await uploadRestaurantFiles(restaurantId, [file])
      setEditData(prev => ({ ...prev, photo: newUrl }))
    } catch (err) {
      console.error(err)
      alert("Failed to upload image")
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this event permanently?")) return
    try {
      await deleteEvent(eventId)
      navigate(-1)
    } catch (err) {
      console.error(err)
      alert("Failed to delete event")
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  function formatTime(timeStr) {
    if (!timeStr) return null
    const [hours, minutes] = timeStr.split(":")
    const h = parseInt(hours)
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4">
        <button onClick={() => navigate(-1)} className="glass w-10 h-10 rounded-full flex items-center justify-center mb-4">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="glass rounded-xl p-6 text-center">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Event not found</p>
        </div>
      </div>
    )
  }

  const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex justify-between items-start py-2">
      <span className="text-white/60 text-sm flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
      <span className="text-white text-sm text-right max-w-[60%]">{value || "—"}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header Image */}
      <div className="relative h-72">
        {event.photo ? (
          <img
            src={event.photo}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Calendar className="w-20 h-20 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Title */}
        <div className="absolute bottom-6 left-4 right-4">
          <h1 className="text-white text-3xl font-bold mb-2">{event.name}</h1>
          {event.eventDate && (
            <span className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full text-white/80 text-sm">
              <Calendar className="w-4 h-4 text-purple-400" />
              {formatDate(event.eventDate)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Date & Time Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-4">
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-white/60 text-xs mb-1">Date</span>
              <span className="text-white font-semibold text-sm">
                {event.eventDate ? formatDate(event.eventDate) : "Not set"}
              </span>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-white/60 text-xs mb-1">Time</span>
              <span className="text-white font-semibold text-sm">
                {event.eventTime ? formatTime(event.eventTime) : "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              About this Event
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Booking Link */}
        {event.bookingLink && (
          <a
            href={event.bookingLink}
            target="_blank"
            rel="noreferrer"
            className="block glass rounded-xl p-4 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Book / RSVP</p>
                  <p className="text-white/60 text-xs truncate max-w-[200px]">{event.bookingLink}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/40" />
            </div>
          </a>
        )}

        {/* Details Card */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            Event Details
          </h3>
          <div className="divide-y divide-white/10">
            <DetailRow label="Date" value={formatDate(event.eventDate)} icon={Calendar} />
            <DetailRow label="Time" value={formatTime(event.eventTime)} icon={Clock} />
            <DetailRow label="Booking Link" value={event.bookingLink ? "Available" : "Not set"} icon={Link} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={openEditModal}
            className="gradient-purple text-white font-semibold h-12 rounded-xl"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="glass border-red-500/50 text-red-400 font-semibold h-12 rounded-xl hover:bg-red-500/20"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Edit Event
            </DialogTitle>
          </DialogHeader>

          {editData && (
            <div className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Event Name *</label>
                <Input
                  value={editData.name}
                  onChange={e => updateField("name", e.target.value)}
                  className="glass border-white/20 text-white h-10"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                  <Image className="w-4 h-4 text-purple-500" />
                  Cover Image
                </label>
                {editData.photo ? (
                  <div className="glass rounded-xl overflow-hidden">
                    <div className="relative h-40">
                      <img
                        src={editData.photo}
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
                        href={editData.photo}
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
                  <label className="glass rounded-xl p-6 border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Image className="w-8 h-8 text-white/30" />
                    <span className="text-white/60 text-sm">Click to upload cover image</span>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files[0]) {
                          handleUploadNewCoverImage(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    Date
                  </label>
                  <Input
                    type="date"
                    value={editData.eventDate}
                    onChange={e => updateField("eventDate", e.target.value)}
                    className="glass border-white/20 text-white h-10 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    Time
                  </label>
                  <Input
                    type="time"
                    value={editData.eventTime}
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
                  value={editData.bookingLink}
                  onChange={e => updateField("bookingLink", e.target.value)}
                  className="glass border-white/20 text-white h-10"
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
                  value={editData.description}
                  onChange={e => updateField("description", e.target.value)}
                  className="glass border-white/20 text-white min-h-[100px]"
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="flex-1 glass border-white/20 text-white h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !editData.name?.trim()}
                  className="flex-1 gradient-purple text-white font-semibold h-11 rounded-xl"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
