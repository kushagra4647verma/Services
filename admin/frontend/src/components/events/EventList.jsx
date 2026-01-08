import { useEffect, useState } from "react"
import { getEvents } from "../../api/events"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Link, Image, ExternalLink } from "lucide-react"

export default function EventList({ restaurantId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    if (!restaurantId) return

    async function load() {
      setLoading(true)
      try {
        const data = await getEvents(restaurantId)
        setEvents(data || [])
      } catch (err) {
        console.error("Failed to load events:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [restaurantId])

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
    const suffix = h >= 12 ? "PM" : "AM"
    const displayH = h % 12 || 12
    return `${displayH}:${minutes} ${suffix}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No events added yet</p>
      </div>
    )
  }

  // If an event is selected, show detail view
  if (selectedEvent) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedEvent(null)}
          className="text-amber-500 text-sm hover:underline flex items-center gap-1"
        >
          ← Back to list
        </button>
        <EventDetailView event={selectedEvent} formatDate={formatDate} formatTime={formatTime} />
      </div>
    )
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {events.map(event => (
        <div
          key={event.id}
          onClick={() => setSelectedEvent(event)}
          className="glass rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
        >
          {/* Event Photo */}
          {event.photo && (
            <div className="h-32 relative">
              <img
                src={event.photo}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="p-4">
            <h4 className="text-white font-medium">{event.name}</h4>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {event.eventDate && (
                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(event.eventDate)}
                </Badge>
              )}
              {event.eventTime && (
                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(event.eventTime)}
                </Badge>
              )}
            </div>

            {event.description && (
              <p className="text-white/50 text-sm mt-2 line-clamp-2">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Event detail view component
function EventDetailView({ event, formatDate, formatTime }) {
  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      {/* Event Photo */}
      <div className="h-48 relative">
        {event.photo ? (
          <>
            <img
              src={event.photo}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <div className="text-center">
              <Image className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-white/30 text-xs mt-1">No event photo</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-white text-xl font-bold">
          {event.name || <span className="text-white/30 italic font-normal">Unnamed Event</span>}
        </h3>

        {/* Date & Time */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-white/80">
            <Calendar className="w-5 h-5 text-amber-500" />
            {event.eventDate ? (
              <span>{formatDate(event.eventDate)}</span>
            ) : (
              <span className="text-white/30 italic">Date not set</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-5 h-5 text-amber-500" />
            {event.eventTime ? (
              <span>{formatTime(event.eventTime)}</span>
            ) : (
              <span className="text-white/30 italic">Time not set</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-white/50 text-sm mb-1">Description</h4>
          {event.description ? (
            <p className="text-white/70 whitespace-pre-line">{event.description}</p>
          ) : (
            <p className="text-white/30 italic">No description provided</p>
          )}
        </div>

        {/* Booking Link */}
        <div>
          <h4 className="text-white/50 text-sm mb-1">Booking Link</h4>
          {event.bookingLink ? (
            <a
              href={event.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
            >
              <Link className="w-4 h-4" />
              {event.bookingLink.length > 40 ? `${event.bookingLink.substring(0, 40)}...` : event.bookingLink}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <p className="text-white/30 italic">No booking link provided</p>
          )}
        </div>
      </div>
    </div>
  )
}
