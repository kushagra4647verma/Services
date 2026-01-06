import { useEffect, useState } from "react"
import { getEvents, createEvent, deleteEvent, updateEvent } from "../../api/events"
import EventForm from "./EventForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Plus, Edit, Trash2, X, ArrowLeft, Clock, Link, FileText, Image, ExternalLink, Eye } from "lucide-react"

export default function EventList({ restaurantId }) {
  const [events, setEvents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!restaurantId) return

    async function load() {
      const data = await getEvents(restaurantId)
      setEvents(data || [])
    }

    load()
  }, [restaurantId])

  async function handleDelete(id) {
    if (!window.confirm("Delete event?")) return

    await deleteEvent(id)

    // 🔥 update SAME state
    setEvents(prev => (prev || []).filter(e => e.id !== id))
  }

  // Detail view helpers
  function openDetailView(event) {
    setSelectedEvent(event)
  }

  function openFullEditModal(event) {
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

  async function handleFullSave() {
    if (!selectedEvent) return
    setSaving(true)
    try {
      const updated = await updateEvent(selectedEvent.id, editData)
      setEvents(prev => (prev || []).map(e => e.id === selectedEvent.id ? updated : e))
      setSelectedEvent(updated)
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
      alert("Failed to update event")
    } finally {
      setSaving(false)
    }
  }

  async function handleDetailDelete() {
    if (!window.confirm("Delete this event permanently?")) return
    try {
      await deleteEvent(selectedEvent.id)
      setEvents(prev => (prev || []).filter(e => e.id !== selectedEvent.id))
      setSelectedEvent(null)
    } catch (err) {
      console.error(err)
      alert("Failed to delete event")
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
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

  // ========== DETAIL VIEW ==========
  if (selectedEvent) {
    const e = selectedEvent
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="relative h-56 rounded-xl overflow-hidden">
          {e.photo ? (
            <img src={e.photo} alt={e.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute top-3 left-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-white text-2xl font-bold mb-1">{e.name}</h2>
            {e.eventDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 glass rounded-full text-white/80 text-xs">
                <Calendar className="w-3 h-3 text-purple-400" />
                {formatDate(e.eventDate)}
              </span>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3">
            <div className="flex flex-col items-center text-center">
              <Calendar className="w-5 h-5 text-purple-500 mb-1" />
              <span className="text-white/60 text-xs">Date</span>
              <span className="text-white font-semibold text-sm">{formatDate(e.eventDate) || "Not set"}</span>
            </div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-5 h-5 text-purple-500 mb-1" />
              <span className="text-white/60 text-xs">Time</span>
              <span className="text-white font-semibold text-sm">{formatTime(e.eventTime) || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {e.description && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              About this Event
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">{e.description}</p>
          </div>
        )}

        {/* Booking Link */}
        {e.bookingLink && (
          <a
            href={e.bookingLink}
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
                  <p className="text-white/60 text-xs truncate max-w-[180px]">{e.bookingLink}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/40" />
            </div>
          </a>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => openFullEditModal(e)} className="gradient-purple text-white font-semibold h-11 rounded-xl">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleDetailDelete} variant="outline" className="glass border-red-500/50 text-red-400 h-11 rounded-xl hover:bg-red-500/20">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Edit Modal - Using EventForm */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Edit Event
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 w-full overflow-hidden">
              <EventForm
                restaurantId={restaurantId}
                initialData={selectedEvent}
                onCreate={updated => {
                  setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
                  setSelectedEvent(updated)
                  setShowEditModal(false)
                }}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <Button
        onClick={() => setShowAddForm(true)}
        className="w-full gradient-purple text-white font-semibold h-11 rounded-xl hover:opacity-90"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Event
      </Button>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {events.map(e => (
            <div
              key={e.id}
              className="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-200"
            >
              {/* Image - Clickable */}
              <div
                className="relative h-28 cursor-pointer"
                onClick={() => openDetailView(e)}
              >
                {e.photo ? (
                  <img src={e.photo} alt={e.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {e.eventDate && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full glass text-xs text-purple-400 font-semibold">
                    {new Date(e.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h4 className="text-white font-medium text-sm truncate">{e.name}</h4>
                {e.eventTime && (
                  <p className="text-white/60 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(e.eventTime)}
                  </p>
                )}
                <Button
                  onClick={() => openDetailView(e)}
                  size="sm"
                  className="w-full h-8 gradient-purple text-white text-xs font-medium"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 glass rounded-xl">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">No events yet</p>
          <p className="text-white/40 text-xs">Add your first event above</p>
        </div>
      )}

      {/* Add Event Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Add Event
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 w-full overflow-hidden">
            <EventForm
              restaurantId={restaurantId}
              onCreate={event => {
                setEvents(prev => ([...(prev || []), event]))
                setShowAddForm(false)
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
