import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getBeverages, updateBeverage, deleteBeverage } from "../../api/beverages"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { deleteStorageFile } from "../../utils/deleteStorageFiles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft, Wine, Edit, Trash2, IndianRupee, Droplets, Sparkles,
  Tag, AlertTriangle, Beaker, FileText, Star, X, Check, ExternalLink, RefreshCw, Image, Utensils
} from "lucide-react"

const CATEGORIES = ["Alcoholic", "Non-Alcoholic"]

export default function BeverageDetail({ restaurantId }) {
  const { beverageId } = useParams()
  const navigate = useNavigate()
  const [beverage, setBeverage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)

  // Tag inputs
  const [ingredientInput, setIngredientInput] = useState("")
  const [allergenInput, setAllergenInput] = useState("")
  const [flavorInput, setFlavorInput] = useState("")
  const [pairingInput, setPairingInput] = useState("")

  useEffect(() => {
    loadBeverage()
  }, [beverageId, restaurantId])

  async function loadBeverage() {
    if (!restaurantId || !beverageId) return
    setLoading(true)
    try {
      const beverages = await getBeverages(restaurantId)
      const found = beverages.find(b => b.id === beverageId)
      setBeverage(found || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openEditModal() {
    setEditData({
      name: beverage.name || "",
      category: beverage.category || "",
      baseType: beverage.baseType || "",
      ingredients: beverage.ingredients || [],
      allergens: beverage.allergens || [],
      perfectPairing: beverage.perfectPairing || [],
      price: beverage.price || "",
      sizeVol: beverage.sizeVol || "",
      isSignatureItem: beverage.isSignatureItem || false,
      flavorTags: beverage.flavorTags || [],
      description: beverage.description || "",
      photo: beverage.photo || "",
    })
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

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        name: editData.name,
        category: editData.category && editData.category.trim() ? editData.category : null,
        baseType: editData.baseType && editData.baseType.trim() ? editData.baseType : null,
        ingredients: editData.ingredients || [],
        allergens: editData.allergens || [],
        perfectPairing: editData.perfectPairing || [],
        price: editData.price ? parseFloat(editData.price) : null,
        sizeVol: editData.sizeVol && editData.sizeVol.trim() ? editData.sizeVol : null,
        isSignatureItem: editData.isSignatureItem || false,
        flavorTags: editData.flavorTags || [],
        description: editData.description && editData.description.trim() ? editData.description.trim() : null,
        photo: editData.photo || null
      }
      const updated = await updateBeverage(beverageId, payload)
      setBeverage(updated)
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
      alert("Failed to update beverage")
    } finally {
      setSaving(false)
    }
  }

  // Cover image handlers
  async function handleDeleteCoverImage() {
    if (!editData.photo) return
    const ok = window.confirm("Delete this cover image permanently?")
    if (!ok) return
    try {
      await deleteStorageFile(editData.photo)
      setEditData(prev => ({ ...prev, photo: "" }))
    } catch (err) {
      console.error(err)
      alert("Failed to delete image")
    }
  }

  async function handleReplaceCoverImage(newFile) {
    if (!newFile) return
    try {
      // Delete old image if exists
      if (editData.photo) {
        await deleteStorageFile(editData.photo)
      }
      // Upload new image
      const [newUrl] = await uploadRestaurantFiles(restaurantId, [newFile])
      setEditData(prev => ({ ...prev, photo: newUrl }))
    } catch (err) {
      console.error(err)
      alert("Failed to replace image")
    }
  }

  async function handleUploadNewCoverImage(file) {
    if (!file) return
    try {
      const [newUrl] = await uploadRestaurantFiles(restaurantId, [file])
      setEditData(prev => ({ ...prev, photo: newUrl }))
    } catch (err) {
      console.error(err)
      alert("Failed to upload image")
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this beverage permanently?")) return
    try {
      await deleteBeverage(beverageId)
      navigate(-1)
    } catch (err) {
      console.error(err)
      alert("Failed to delete beverage")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    )
  }

  if (!beverage) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4">
        <button onClick={() => navigate(-1)} className="glass w-10 h-10 rounded-full flex items-center justify-center mb-4">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="glass rounded-xl p-6 text-center">
          <Wine className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Beverage not found</p>
        </div>
      </div>
    )
  }

  const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex justify-between items-start py-2">
      <span className="text-white/60 text-sm flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
      <span className="text-white text-sm text-right max-w-[60%]">{value || "—"}</span>
    </div>
  )

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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header Image */}
      <div className="relative h-72">
        {beverage.photo || beverage.image ? (
          <img
            src={beverage.photo || beverage.image}
            alt={beverage.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
            <Wine className="w-20 h-20 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Title */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            {beverage.isSignatureItem && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/30 text-amber-400 border border-amber-500/40">
                <Star className="w-3 h-3 fill-amber-400" />
                Signature
              </span>
            )}
            {beverage.category && (
              <span className="px-2 py-1 glass rounded-full text-white/80 text-xs">
                {beverage.category}
              </span>
            )}
          </div>
          <h1 className="text-white text-3xl font-bold">{beverage.name}</h1>
          {beverage.baseType && (
            <span className="text-white/60 text-sm">{beverage.baseType}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Price</span>
              <span className="text-amber-500 text-xl font-bold">
                {beverage.price ? `₹${beverage.price}` : "—"}
              </span>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Size</span>
              <span className="text-white text-xl font-bold">
                {beverage.sizeVol ? `${beverage.sizeVol} ml` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Details
          </h3>
          <div className="divide-y divide-white/10">
            <DetailRow label="Category" value={beverage.category} icon={Tag} />
            <DetailRow label="Type / Style" value={beverage.baseType} icon={Beaker} />
            {beverage.description && (
              <div className="py-2">
                <span className="text-white/60 text-sm block mb-1">Description</span>
                <p className="text-white/80 text-sm">{beverage.description}</p>
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
          <TagList items={beverage.ingredients} color="amber" />
        </div>

        {/* Allergens */}
        {beverage.allergens?.length > 0 && (
          <div className="glass rounded-xl p-4 border border-red-500/30">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Allergens
            </h3>
            <TagList items={beverage.allergens} color="red" />
          </div>
        )}

        {/* Flavor Tags */}
        {beverage.flavorTags?.length > 0 && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Flavor Profile
            </h3>
            <TagList items={beverage.flavorTags} color="purple" />
          </div>
        )}

        {/* Perfect Pairing */}
        {beverage.perfectPairing?.length > 0 && (
          <div className="glass rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-green-500" />
              Perfect Pairing
            </h3>
            <TagList items={beverage.perfectPairing} color="green" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={openEditModal}
            className="gradient-amber text-black font-semibold h-12 rounded-xl"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="glass border-red-500/50 text-red-400 font-semibold h-12 rounded-xl hover:bg-red-500/20"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-500" />
              Edit Beverage
            </DialogTitle>
          </DialogHeader>

          {editData && (
            <div className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Name *</label>
                <Input
                  value={editData.name}
                  onChange={e => updateField("name", e.target.value)}
                  className="glass border-white/20 text-white h-10"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Category</label>
                <Select value={editData.category} onValueChange={v => updateField("category", v)}>
                  <SelectTrigger className="glass border-white/20 text-white h-10">
                    <SelectValue placeholder="Alcoholic or Non-Alcoholic?" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/20">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type / Style */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Base Type</label>
                <Input
                  value={editData.baseType}
                  onChange={e => updateField("baseType", e.target.value)}
                  placeholder="e.g., Margarita"
                  className="glass border-white/20 text-white h-10"
                />
              </div>

              {/* Price & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Price (₹)</label>
                  <Input
                    type="number"
                    value={editData.price}
                    onChange={e => updateField("price", e.target.value)}
                    className="glass border-white/20 text-white h-10"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Size / Volume (ml)</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={editData.sizeVol}
                    onChange={e => {
                      const val = e.target.value
                      if (val === '' || !isNaN(parseFloat(val))) {
                        updateField("sizeVol", val)
                      } else {
                        alert("Please enter a valid number for Size/Volume")
                      }
                    }}
                    placeholder="e.g., 330"
                    className="glass border-white/20 text-white h-10"
                  />
                </div>
              </div>

              {/* Signature Toggle */}
              <div className="flex items-center justify-between glass rounded-xl p-3">
                <span className="text-white text-sm">Signature Item</span>
                <Switch
                  checked={editData.isSignatureItem}
                  onCheckedChange={v => updateField("isSignatureItem", v)}
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Ingredients</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToArray("ingredients", ingredientInput, setIngredientInput))}
                    placeholder="Add ingredient"
                    className="glass border-white/20 text-white h-9 text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArray("ingredients", ingredientInput, setIngredientInput)}
                    className="glass border-white/20 text-white h-9"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {editData.ingredients?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editData.ingredients.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {item}
                        <button onClick={() => removeFromArray("ingredients", idx)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Allergens */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Allergens</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={allergenInput}
                    onChange={e => setAllergenInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToArray("allergens", allergenInput, setAllergenInput))}
                    placeholder="Add allergen"
                    className="glass border-white/20 text-white h-9 text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArray("allergens", allergenInput, setAllergenInput)}
                    className="glass border-white/20 text-white h-9"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {editData.allergens?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editData.allergens.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                        {item}
                        <button onClick={() => removeFromArray("allergens", idx)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Flavor Tags */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Flavor Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={flavorInput}
                    onChange={e => setFlavorInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToArray("flavorTags", flavorInput, setFlavorInput))}
                    placeholder="e.g., Sweet, Sour"
                    className="glass border-white/20 text-white h-9 text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArray("flavorTags", flavorInput, setFlavorInput)}
                    className="glass border-white/20 text-white h-9"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {editData.flavorTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editData.flavorTags.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {item}
                        <button onClick={() => removeFromArray("flavorTags", idx)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Perfect Pairing */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Perfect Pairing</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={pairingInput}
                    onChange={e => setPairingInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addToArray("perfectPairing", pairingInput, setPairingInput))}
                    placeholder="Best food to enjoy with this drink"
                    className="glass border-white/20 text-white h-9 text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArray("perfectPairing", pairingInput, setPairingInput)}
                    className="glass border-white/20 text-white h-9"
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {editData.perfectPairing?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editData.perfectPairing.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                        {item}
                        <button onClick={() => removeFromArray("perfectPairing", idx)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div>
                <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                  <Image className="w-4 h-4 text-amber-500" />
                  Cover Image
                </label>
                {editData.photo ? (
                  <div className="glass rounded-xl overflow-hidden">
                    <div className="relative h-40">
                      <img
                        src={editData.photo}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleDeleteCoverImage}
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 glass border-white/20 text-red-400 text-xs hover:bg-red-500/20 hover:border-red-500/50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                        <label className="flex-1">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="w-full h-8 glass border-white/20 text-white text-xs hover:bg-amber-500/20 hover:border-amber-500/50 cursor-pointer"
                          >
                            <span>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Replace
                            </span>
                          </Button>
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={e => {
                              if (e.target.files[0]) {
                                handleReplaceCoverImage(e.target.files[0])
                              }
                            }}
                          />
                        </label>
                      </div>
                      <a
                        href={editData.photo}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1 text-amber-500/80 hover:text-amber-500 text-xs transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open
                      </a>
                    </div>
                  </div>
                ) : (
                  <label className="glass rounded-xl p-6 border-2 border-dashed border-white/20 hover:border-amber-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Image className="w-8 h-8 text-white/30" />
                    <span className="text-white/60 text-sm">Click to upload cover image</span>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files[0]) {
                          handleUploadNewCoverImage(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">Description</label>
                <Textarea
                  value={editData.description}
                  onChange={e => updateField("description", e.target.value)}
                  className="glass border-white/20 text-white min-h-[80px]"
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="flex-1 glass border-white/20 text-white h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !editData.name?.trim()}
                  className="flex-1 gradient-amber text-black font-semibold h-11 rounded-xl"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
