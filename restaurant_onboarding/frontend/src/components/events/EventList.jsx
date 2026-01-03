import { useEffect, useState } from "react"
import { getEvents, createEvent, deleteEvent, updateEvent } from "../../api/events"
import EventForm from "./EventForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Plus, Edit, Trash2, X, Check } from "lucide-react"

export default function EventList({ restaurantId }) {
  const [events, setEvents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    if (!restaurantId) return

    async function load() {
      const data = await getEvents(restaurantId)
      setEvents(data)
    }

    load()
  }, [restaurantId])

  async function handleDelete(id) {
    if (!window.confirm("Delete event?")) return

    await deleteEvent(id)

    // 🔥 update SAME state
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  function startEdit(event) {
    setEditingId(event.id)
    setEditName(event.name)
  }

  async function saveEdit(eventId) {
    try {
      const updated = await updateEvent(eventId, { name: editName })
      setEvents(prev =>
        prev.map(e => e.id === eventId ? updated : e)
      )
      setEditingId(null)
      setEditName("")
    } catch (err) {
      console.error(err)
      alert("Failed to update event")
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName("")
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
              {/* Image */}
              <div className="relative h-28">
                {e.image ? (
                  <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                {editingId === e.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={ev => setEditName(ev.target.value)}
                      className="glass border-white/20 text-white text-sm h-8"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveEdit(e.id)}
                        size="sm"
                        className="flex-1 h-8 gradient-purple text-white text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 glass border-white/20 text-white text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-white font-medium text-sm truncate">{e.name}</h4>
                    {e.date && (
                      <p className="text-white/60 text-xs">{new Date(e.date).toLocaleDateString()}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEdit(e)}
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 glass border-white/20 text-white text-xs hover:bg-purple-500/20 hover:border-purple-500/50"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(e.id)}
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 glass border-white/20 text-red-400 text-xs hover:bg-red-500/20 hover:border-red-500/50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
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
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Add Event
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <EventForm
              restaurantId={restaurantId}
              onCreate={event => {
                setEvents(prev => [...prev, event])
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
