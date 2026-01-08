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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wine, Plus, Edit, Trash2, X, Check, ArrowLeft, IndianRupee, Star, Tag, Droplets, Beaker, AlertTriangle, Sparkles, FileText, Eye, Utensils } from "lucide-react"

const CATEGORIES = ["Cocktail", "Mocktail", "Beer", "Wine", "Whiskey", "Vodka", "Rum", "Gin", "Tequila", "Coffee", "Tea", "Juice", "Smoothie", "Other"]
const DRINK_TYPES = ["Alcoholic", "Non-Alcoholic"]

export default function BeverageList({ restaurantId }) {
  const [beverages, setBeverages] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedBeverage, setSelectedBeverage] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)

  // Tag inputs for edit modal
  const [ingredientInput, setIngredientInput] = useState("")
  const [allergenInput, setAllergenInput] = useState("")
  const [flavorInput, setFlavorInput] = useState("")

  useEffect(() => {
    if (!restaurantId) return

    async function load() {
      const data = await getBeverages(restaurantId)
      setBeverages(data || [])
    }

    load()
  }, [restaurantId])

  async function handleDelete(id) {
    if (!window.confirm("Delete beverage?")) return

    await deleteBeverage(id)
    setBeverages(prev => (prev || []).filter(b => b.id !== id))
  }

  function startEdit(beverage) {
    setEditingId(beverage.id)
    setEditName(beverage.name)
  }

  async function saveEdit(beverageId) {
    const updated = await updateBeverage(beverageId, {
      name: editName
    })

    setBeverages(prev => (prev || []).map(b => b.id === beverageId ? updated : b))

    setEditingId(null)
    setEditName("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName("")
  }

  // Detail view helpers
  function openDetailView(beverage) {
    setSelectedBeverage(beverage)
  }

  function openFullEditModal(beverage) {
    setEditData({
      name: beverage.name || "",
      category: beverage.category || "",
      drinkType: beverage.drinkType || "",
      baseType: beverage.baseType || "",
      ingredients: beverage.ingredients || [],
      allergens: beverage.allergens || [],
      perfectPairing: beverage.perfectPairing || [],
      price: beverage.price || "",
      sizeVol: beverage.sizeVol || "",
      isSignatureItem: beverage.isSignatureItem || false,
      flavorTags: beverage.flavorTags || [],
      description: beverage.description || "",
    })
    setIngredientInput("")
    setAllergenInput("")
    setFlavorInput("")
    setShowEditModal(true)
  }

  function updateField(field, value) {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  function addToArray(field, value, setInput) {
    if (value.trim()) {
      setEditData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }))
      setInput("")
    }
  }

  function removeFromArray(field, index) {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  async function handleFullSave() {
    if (!selectedBeverage) return
    setSaving(true)
    try {
      const updated = await updateBeverage(selectedBeverage.id, {
        ...editData,
        price: editData.price ? parseFloat(editData.price) : null
      })
      setBeverages(prev => (prev || []).map(b => b.id === selectedBeverage.id ? updated : b))
      setSelectedBeverage(updated)
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
      alert("Failed to update beverage")
    } finally {
      setSaving(false)
    }
  }

  async function handleDetailDelete() {
    if (!window.confirm("Delete this beverage permanently?")) return
    try {
      await deleteBeverage(selectedBeverage.id)
      setBeverages(prev => (prev || []).filter(b => b.id !== selectedBeverage.id))
      setSelectedBeverage(null)
    } catch (err) {
      console.error(err)
      alert("Failed to delete beverage")
    }
  }

  const TagList = ({ items, color = "amber" }) => (
    items && items.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`px-2 py-0.5 rounded-full text-xs bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}
          >
            {item}
          </span>
        ))}
      </div>
    ) : <span className="text-white/40 text-sm">—</span>
  )

  // ========== DETAIL VIEW ==========
  if (selectedBeverage) {
    const b = selectedBeverage
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="relative h-56 rounded-xl overflow-hidden">
          {b.photo || b.image ? (
            <img src={b.photo || b.image} alt={b.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
              <Wine className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <button
            onClick={() => setSelectedBeverage(null)}
            className="absolute top-3 left-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              {b.isSignatureItem && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/30 text-amber-400 border border-amber-500/40">
                  <Star className="w-3 h-3 fill-amber-400" />
                  Signature
                </span>
              )}
              {b.drinkType && (
                <span className="px-2 py-0.5 glass rounded-full text-white/80 text-xs">{b.drinkType}</span>
              )}
            </div>
            <h2 className="text-white text-2xl font-bold">{b.name}</h2>
            {b.baseType && <p className="text-white/60 text-sm">{b.baseType}</p>}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Price</span>
              <span className="text-amber-500 text-lg font-bold">{b.price ? `₹${b.price}` : "—"}</span>
            </div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Size</span>
              <span className="text-white text-lg font-bold">{b.sizeVol ? `${b.sizeVol} ml` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Details
          </h3>
          <div className="space-y-2 text-sm divide-y divide-white/10">
            <div className="flex justify-between py-1">
              <span className="text-white/60">Category</span>
              <span className="text-white">{b.category || "—"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/60">Drink Type</span>
              <span className="text-white">{b.drinkType || "—"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/60">Base Type</span>
              <span className="text-white">{b.baseType || "—"}</span>
            </div>
            {b.description && (
              <div className="py-2">
                <span className="text-white/60 block mb-1">Description</span>
                <p className="text-white/80">{b.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Beaker className="w-4 h-4 text-amber-500" />
            Ingredients
          </h3>
          <TagList items={b.ingredients} color="amber" />
        </div>

        {/* Allergens */}
        {b.allergens?.length > 0 && (
          <div className="glass rounded-xl p-4 border border-red-500/30">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Allergens
            </h3>
            <TagList items={b.allergens} color="red" />
          </div>
        )}

        {/* Flavor Tags */}
        {b.flavorTags?.length > 0 && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Flavor Profile
            </h3>
            <TagList items={b.flavorTags} color="purple" />
          </div>
        )}

        {/* Perfect Pairing */}
        {b.perfectPairing?.length > 0 && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-green-500" />
              Perfect Pairing
            </h3>
            <TagList items={b.perfectPairing} color="green" />
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => openFullEditModal(b)} className="gradient-amber text-black font-semibold h-11 rounded-xl">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleDetailDelete} variant="outline" className="glass border-red-500/50 text-red-400 h-11 rounded-xl hover:bg-red-500/20">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Edit Modal - Using BeverageForm */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wine className="w-5 h-5 text-amber-500" />
                Edit Beverage
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 w-full overflow-hidden">
              <BeverageForm
                restaurantId={restaurantId}
                initialData={selectedBeverage}
                onCreate={updated => {
                  setBeverages(prev => prev.map(b => b.id === updated.id ? updated : b))
                  setSelectedBeverage(updated)
                  setShowEditModal(false)
                }}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
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
              {/* Image - Clickable */}
              <div
                className="relative h-28 cursor-pointer"
                onClick={() => openDetailView(b)}
              >
                {b.photo || b.image ? (
                  <img src={b.photo || b.image} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                    <Wine className="w-10 h-10 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {b.isSignatureItem && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                )}
                {b.price && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full glass text-xs text-amber-400 font-semibold">
                    ₹{b.price}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h4 className="text-white font-medium text-sm truncate">{b.name}</h4>
                {b.category && (
                  <p className="text-white/60 text-xs">{b.category}</p>
                )}
                <Button
                  onClick={() => openDetailView(b)}
                  size="sm"
                  className="w-full h-8 gradient-amber text-black text-xs font-medium"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
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
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-500" />
              Add Beverage
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 w-full overflow-hidden">
            <BeverageForm
              restaurantId={restaurantId}
              onCreate={b => {
                setBeverages(prev => ([...(prev || []), b]))
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
