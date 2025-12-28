import { useEffect, useState } from "react"
import {
  getBeverages,
  createBeverage,
  deleteBeverage,
  updateBeverage
} from "../../api/beverages"
import BeverageForm from "./BeverageForm"

export default function BeverageList({ restaurantId }) {
  const [beverages, setBeverages] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    if (!restaurantId) return

    async function load() {
      const data = await getBeverages(restaurantId)
      setBeverages(data)
    }

    load()
  }, [restaurantId])

  async function handleDelete(id) {
    if (!window.confirm("Delete beverage?")) return

    await deleteBeverage(id)

    setBeverages(prev =>
      prev.filter(b => b.id !== id)
    )
  }

  function startEdit(beverage) {
    setEditingId(beverage.id)
    setEditName(beverage.name)
  }

  async function saveEdit(beverageId) {
    const updated = await updateBeverage(beverageId, {
      name: editName
    })

    setBeverages(prev =>
      prev.map(b =>
        b.id === beverageId ? updated : b
      )
    )

    setEditingId(null)
    setEditName("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName("")
  }

  return (
    <>
      <h3>Beverages</h3>

      <BeverageForm
        restaurantId={restaurantId}
        onCreate={b =>
          setBeverages(prev => [...prev, b])
        }
      />

      {beverages.map(b => (
        <div key={b.id}>
          {editingId === b.id ? (
            <>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
              <button onClick={() => saveEdit(b.id)}>Save</button>
              <button onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              {b.name}
              <button onClick={() => startEdit(b)}>Edit</button>
              <button onClick={() => handleDelete(b.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </>
  )
}
