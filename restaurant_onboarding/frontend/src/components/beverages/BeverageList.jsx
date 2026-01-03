import { useEffect, useState } from "react"
import {
  getBeverages,
  createBeverage,
  deleteBeverage,
  updateBeverage
} from "../../api/beverages"
import BeverageForm from "./BeverageForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wine, Plus, Edit, Trash2, X, Check } from "lucide-react"

export default function BeverageList({ restaurantId }) {
  const [beverages, setBeverages] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

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
    <div className="space-y-4">
      {/* Add Button */}
      <Button
        onClick={() => setShowAddForm(true)}
        className="w-full gradient-amber text-black font-semibold h-11 rounded-xl hover:opacity-90"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Beverage
      </Button>

      {/* Beverages Grid */}
      {beverages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {beverages.map(b => (
            <div
              key={b.id}
              className="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-200"
            >
              {/* Image */}
              <div className="relative h-28">
                {b.image ? (
                  <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                    <Wine className="w-10 h-10 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                {editingId === b.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="glass border-white/20 text-white text-sm h-8"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveEdit(b.id)}
                        size="sm"
                        className="flex-1 h-8 gradient-amber text-black text-xs"
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
                    <h4 className="text-white font-medium text-sm truncate">{b.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEdit(b)}
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 glass border-white/20 text-white text-xs hover:bg-amber-500/20 hover:border-amber-500/50"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(b.id)}
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
          <Wine className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">No beverages yet</p>
          <p className="text-white/40 text-xs">Add your first beverage above</p>
        </div>
      )}

      {/* Add Beverage Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-500" />
              Add Beverage
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <BeverageForm
              restaurantId={restaurantId}
              onCreate={b => {
                setBeverages(prev => [...prev, b])
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
