import { useState } from "react"
import { createEvent } from "../../api/events"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, X } from "lucide-react"

export default function EventForm({ restaurantId, onCreate, onCancel }) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!name.trim()) return
    
    setLoading(true)
    try {
      const event = await createEvent(restaurantId, { name })
      onCreate(event)
      setName("")
    } catch (err) {
      console.error(err)
      alert("Failed to add event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          Event Name *
        </label>
        <Input
          placeholder="Enter event name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-12"
        />
      </div>

      <div className="flex gap-3">
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
          disabled={loading || !name.trim()}
          className={`${onCancel ? 'flex-1' : 'w-full'} gradient-purple text-white font-semibold h-11 rounded-xl hover:opacity-90`}
        >
          {loading ? "Adding..." : "Add Event"}
        </Button>
      </div>
    </div>
  )
}
