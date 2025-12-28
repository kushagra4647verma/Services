import { useState } from "react"
import { createEvent } from "../../api/events"

export default function EventForm({ restaurantId, onCreate }) {
  const [name, setName] = useState("")

  async function submit() {
    const event = await createEvent(restaurantId, { name })
    onCreate(event)
    setName("")
  }

  return (
    <>
      <input placeholder="Event name" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={submit}>Add</button>
    </>
  )
}
