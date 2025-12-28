import { useState } from "react"

export default function RestaurantForm({ onSave }) {
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")

  return (
    <>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
      <button onClick={() => onSave({ name, bio })}>Save & Continue</button>
    </>
  )
}
