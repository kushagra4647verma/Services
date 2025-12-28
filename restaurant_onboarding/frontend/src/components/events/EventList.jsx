import { useEffect, useState } from "react"
import { getEvents, createEvent, deleteEvent } from "../../api/events"
import EventForm from "./EventForm"

export default function EventList({ restaurantId }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    getEvents(restaurantId).then(setItems)
  }, [restaurantId])

  async function handleDelete(id) {
    if (!window.confirm("Delete event?")) return
    await deleteEvent(id)
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <>
      <h3>Events</h3>
      <EventForm restaurantId={restaurantId} onCreate={e => setItems([...items, e])} />
      {items.map(e => (
        <div key={e.id}>
          {e.name}
          <button onClick={() => handleDelete(e.id)}>Delete</button>
        </div>
      ))}
    </>
  )
}
