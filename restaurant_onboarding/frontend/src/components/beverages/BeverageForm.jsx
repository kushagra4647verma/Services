import { useState } from "react"
import { createBeverage } from "../../api/beverages"

export default function BeverageForm({ restaurantId, onCreate }) {
  const [name, setName] = useState("")

  async function submit() {
    const beverage = await createBeverage(restaurantId, { name })
    onCreate(beverage)
    setName("")
  }

  return (
    <>
      <input placeholder="Beverage name" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={submit}>Add</button>
    </>
  )
}
