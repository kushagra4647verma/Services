import { useEffect, useState } from "react"
import { getEvents, createEvent, deleteEvent } from "../../api/events"
import EventForm from "./EventForm"

export default function EventList({ restaurantId }) {
  const [events, setEvents] = useState([])

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

  return (
    <>
      <h3>Events</h3>

      <EventForm
        restaurantId={restaurantId}
        onCreate={event =>
          setEvents(prev => [...prev, event])
        }
      />

      {events.map(e => (
        <div key={e.id}>
          {e.name}
          <button onClick={() => handleDelete(e.id)}>
            Delete
          </button>
        </div>
      ))}
    </>
  )
}
