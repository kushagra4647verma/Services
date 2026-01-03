import { useState } from "react"
import { createBeverage, updateBeverage } from "../../api/beverages"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { deleteStorageFile } from "../../utils/deleteStorageFiles"
import FileDropzone from "../common/FileDropzone"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wine, X, DollarSign, Droplets, Sparkles, Tag, AlertTriangle, Beaker, FileText, Star, Image, Trash2, RefreshCw, ExternalLink } from "lucide-react"

const CATEGORIES = ["Cocktail", "Mocktail", "Beer", "Wine", "Whiskey", "Vodka", "Rum", "Gin", "Tequila", "Coffee", "Tea", "Juice", "Smoothie", "Other"]
const BASE_TYPES = ["Alcoholic", "Non-Alcoholic"]

export default function BeverageForm({ restaurantId, onCreate, onCancel, initialData = null }) {
  const isEditing = !!initialData?.id
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    baseType: initialData?.baseType || "",
    type: initialData?.type || "",
    ingredients: initialData?.ingredients || [],
    allergens: initialData?.allergens || [],
    price: initialData?.price || "",
    sizeVol: initialData?.sizeVol || "",
    isSignatureItem: initialData?.isSignatureItem || false,
    flavorTags: initialData?.flavorTags || [],
    description: initialData?.description || "",
    photo: initialData?.photo || "",
  })
  const [ingredientInput, setIngredientInput] = useState("")
  const [allergenInput, setAllergenInput] = useState("")
  const [flavorInput, setFlavorInput] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  function updateField(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function addToArray(field, value, setInput) {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
      setInput("")
    }
  }

  function removeFromArray(field, index) {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  async function submit() {
    if (!formData.name.trim()) return
    
    setLoading(true)
    try {
      // Upload image if selected
      let photoUrl = formData.photo || null
      if (selectedFile) {
        const urls = await uploadRestaurantFiles(restaurantId, [selectedFile])
        photoUrl = urls[0]
      }

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        photo: photoUrl,
        baseType: formData.baseType,
        sizeVol: formData.sizeVol,
        isSignatureItem: formData.isSignatureItem,
        flavorTags: formData.flavorTags,
      }

      let beverage
      if (isEditing) {
        beverage = await updateBeverage(initialData.id, payload)
      } else {
        beverage = await createBeverage(restaurantId, payload)
      }
      onCreate(beverage)
      // Reset form
      setFormData({
        name: "", category: "", baseType: "", type: "",
        ingredients: [], allergens: [], price: "", sizeVol: "",
        isSignatureItem: false, flavorTags: [], description: "", photo: ""
      })
      setSelectedFile(null)
    } catch (err) {
      console.error(err)
      alert(isEditing ? "Failed to update beverage" : "Failed to add beverage")
    } finally {
      setLoading(false)
    }
  }

  // Cover image handlers
  async function handleDeleteCoverImage() {
    if (!formData.photo) return
    const ok = window.confirm("Delete this cover image permanently?")
    if (!ok) return
    try {
      await deleteStorageFile(formData.photo)
      setFormData(prev => ({ ...prev, photo: "" }))
    } catch (err) {
      console.error(err)
      alert("Failed to delete image")
    }
  }

  async function handleReplaceCoverImage(newFile) {
    if (!newFile) return
    try {
      if (formData.photo) {
        await deleteStorageFile(formData.photo)
      }
      const [newUrl] = await uploadRestaurantFiles(restaurantId, [newFile])
      setFormData(prev => ({ ...prev, photo: newUrl }))
    } catch (err) {
      console.error(err)
      alert("Failed to replace image")
    }
  }

  const TagInput = ({ label, icon: Icon, value, items, onAdd, onRemove, placeholder, color = "amber" }) => (
    <div>
      <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
        <Icon className={`w-4 h-4 text-${color}-500`} />
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={e => onAdd(e.target.value, true)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAdd(value, false)
            }
          }}
          className="glass border-white/20 text-white placeholder:text-white/40 h-10 flex-1"
        />
        <Button
          type="button"
          onClick={() => onAdd(value, false)}
          className={`glass border-white/20 text-white h-10 px-4 hover:bg-${color}-500/20`}
          variant="outline"
        >
          Add
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Name */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Wine className="w-4 h-4 text-amber-500" />
          Beverage Name *
        </label>
        <Input
          placeholder="Enter beverage name"
          value={formData.name}
          onChange={e => updateField("name", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-12"
        />
      </div>

      {/* Category & Base Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-500" />
            Category
          </label>
          <Select value={formData.category} onValueChange={v => updateField("category", v)}>
            <SelectTrigger className="glass border-white/20 text-white h-10">
              <SelectValue placeholder="Select category" />
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

        <div>
          <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
            <Droplets className="w-4 h-4 text-amber-500" />
            Base Type
          </label>
          <Select value={formData.baseType} onValueChange={v => updateField("baseType", v)}>
            <SelectTrigger className="glass border-white/20 text-white h-10">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/20">
              {BASE_TYPES.map(type => (
                <SelectItem key={type} value={type} className="text-white hover:bg-white/10">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type (free text) */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Beaker className="w-4 h-4 text-amber-500" />
          Type / Style
        </label>
        <Input
          placeholder="e.g., Margarita, Espresso Martini..."
          value={formData.type}
          onChange={e => updateField("type", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-10"
        />
      </div>

      {/* Price & Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            Price (₹)
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={e => updateField("price", e.target.value)}
            className="glass border-white/20 text-white placeholder:text-white/40 h-10"
          />
        </div>

        <div>
          <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
            <Droplets className="w-4 h-4 text-amber-500" />
            Size / Volume
          </label>
          <Input
            placeholder="e.g., 330ml, Large"
            value={formData.sizeVol}
            onChange={e => updateField("sizeVol", e.target.value)}
            className="glass border-white/20 text-white placeholder:text-white/40 h-10"
          />
        </div>
      </div>

      {/* Signature Item Toggle */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-white font-medium text-sm">Signature Item</p>
            <p className="text-white/60 text-xs">Mark this as a house specialty</p>
          </div>
        </div>
        <Switch
          checked={formData.isSignatureItem}
          onCheckedChange={v => updateField("isSignatureItem", v)}
        />
      </div>

      {/* Ingredients */}
      <TagInput
        label="Ingredients"
        icon={Beaker}
        value={ingredientInput}
        items={formData.ingredients}
        onAdd={(v, isTyping) => isTyping ? setIngredientInput(v) : addToArray("ingredients", ingredientInput, setIngredientInput)}
        onRemove={(idx) => removeFromArray("ingredients", idx)}
        placeholder="Add ingredient and press Enter"
        color="amber"
      />

      {/* Allergens */}
      <TagInput
        label="Allergens"
        icon={AlertTriangle}
        value={allergenInput}
        items={formData.allergens}
        onAdd={(v, isTyping) => isTyping ? setAllergenInput(v) : addToArray("allergens", allergenInput, setAllergenInput)}
        onRemove={(idx) => removeFromArray("allergens", idx)}
        placeholder="Add allergen and press Enter"
        color="red"
      />

      {/* Flavor Tags */}
      <TagInput
        label="Flavor Tags"
        icon={Sparkles}
        value={flavorInput}
        items={formData.flavorTags}
        onAdd={(v, isTyping) => isTyping ? setFlavorInput(v) : addToArray("flavorTags", flavorInput, setFlavorInput)}
        onRemove={(idx) => removeFromArray("flavorTags", idx)}
        placeholder="e.g., Sweet, Sour, Spicy..."
        color="purple"
      />

      {/* Cover Image */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Image className="w-4 h-4 text-amber-500" />
          Cover Image
        </label>
        {formData.photo ? (
          <div className="glass rounded-xl overflow-hidden">
            <div className="relative h-40">
              <img
                src={formData.photo}
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
                href={formData.photo}
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
          <div className="glass rounded-xl p-3 border border-white/20">
            <FileDropzone
              maxFiles={1}
              onFilesSelected={files => setSelectedFile(files[0] || null)}
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          Description
        </label>
        <Textarea
          placeholder="Describe this beverage..."
          value={formData.description}
          onChange={e => updateField("description", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 glass border-white/20 text-white h-11 rounded-xl hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
        <Button
          onClick={submit}
          disabled={loading || !formData.name.trim()}
          className={`${onCancel ? 'flex-1' : 'w-full'} gradient-amber text-black font-semibold h-11 rounded-xl hover:opacity-90`}
        >
          {loading ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Beverage")}
        </Button>
      </div>
    </div>
  )
}
