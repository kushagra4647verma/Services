import { useState, useEffect } from "react"
import { createBeverage, updateBeverage, getAllUserBeverages } from "../../api/beverages"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { deleteStorageFile } from "../../utils/deleteStorageFiles"
import { copyImageToRestaurant } from "../../utils/copyImageToRestaurant"
import FileDropzone from "../common/FileDropzone"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { Wine, X, IndianRupee, Droplets, Sparkles, Tag, AlertTriangle, Beaker, FileText, Star, Image, Trash2, RefreshCw, ExternalLink, Utensils, Copy, Loader2 } from "lucide-react"

const CATEGORIES = ["Alcoholic", "Non-Alcoholic"]

// TagInput component defined outside to prevent re-creation on every render
const TagInput = ({ label, icon: Icon, value, items, onInputChange, onAdd, onRemove, placeholder, color = "amber" }) => (
  <div className="w-full overflow-hidden">
    <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
      <Icon className={`w-4 h-4 text-${color}-500`} />
      {label}
    </label>
    <div className="flex gap-2 mb-2 w-full">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onInputChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault()
            onAdd()
          }
        }}
        className="glass border-white/20 text-white placeholder:text-white/40 h-10 flex-1 min-w-0"
      />
      <Button
        type="button"
        onClick={onAdd}
        className={`glass border-white/20 text-white h-10 px-3 sm:px-4 hover:bg-${color}-500/20 flex-shrink-0`}
        variant="outline"
      >
        Add
      </Button>
    </div>
    {items.length > 0 && (
      <div className="flex flex-wrap gap-2 w-full">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-${color}-500/20 text-${color}-400 border border-${color}-500/30 max-w-full`}
          >
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="hover:text-white flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    )}
  </div>
)

export default function BeverageForm({ restaurantId, onCreate, onCancel, initialData = null }) {
  const isEditing = !!initialData?.id
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    baseType: initialData?.baseType || "",
    ingredients: initialData?.ingredients || [],
    allergens: initialData?.allergens || [],
    perfectPairing: initialData?.perfectPairing || [],
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
  const [pairingInput, setPairingInput] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Copy from another beverage feature
  const [allBeverages, setAllBeverages] = useState([])
  const [loadingBeverages, setLoadingBeverages] = useState(false)
  const [copyingBeverage, setCopyingBeverage] = useState(false)
  const [selectedBeverageToCopy, setSelectedBeverageToCopy] = useState("")

  // Load all user's beverages for the copy feature (only when not editing)
  useEffect(() => {
    if (isEditing) return
    
    async function loadBeverages() {
      setLoadingBeverages(true)
      try {
        const beverages = await getAllUserBeverages()
        // Show ALL beverages from all restaurants (user can copy from same restaurant too)
        setAllBeverages(beverages || [])
      } catch (err) {
        console.error("Failed to load beverages for copy:", err)
      } finally {
        setLoadingBeverages(false)
      }
    }
    
    loadBeverages()
  }, [restaurantId, isEditing])

  async function handleCopyBeverage() {
    if (!selectedBeverageToCopy) return
    
    const beverageToCopy = allBeverages.find(b => b.id === selectedBeverageToCopy)
    if (!beverageToCopy) return
    
    setCopyingBeverage(true)
    
    try {
      let photoUrl = beverageToCopy.photo || ""
      
      // If beverage is from a different restaurant, copy the image to this restaurant's storage
      if (beverageToCopy.restaurantid !== restaurantId && beverageToCopy.photo) {
        try {
          const newPhotoUrl = await copyImageToRestaurant(beverageToCopy.photo, restaurantId)
          if (newPhotoUrl) {
            photoUrl = newPhotoUrl
            toast.success("Image copied to this restaurant's storage")
          }
        } catch (err) {
          console.error("Failed to copy image:", err)
          toast.error("Failed to copy image. You may need to upload a new one.")
          photoUrl = "" // Clear photo since we couldn't copy it
        }
      }
      
      setFormData({
        name: beverageToCopy.name || "",
        category: beverageToCopy.category || "",
        baseType: beverageToCopy.baseType || "",
        ingredients: beverageToCopy.ingredients || [],
        allergens: beverageToCopy.allergens || [],
        perfectPairing: beverageToCopy.perfectPairing || [],
        price: beverageToCopy.price || "",
        sizeVol: beverageToCopy.sizeVol || "",
        isSignatureItem: beverageToCopy.isSignatureItem || false,
        flavorTags: beverageToCopy.flavorTags || [],
        description: beverageToCopy.description || "",
        photo: photoUrl,
      })
      setSelectedBeverageToCopy("")
      toast.success("Beverage details copied!")
    } catch (err) {
      console.error("Failed to copy beverage:", err)
      toast.error("Failed to copy beverage")
    } finally {
      setCopyingBeverage(false)
    }
  }

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

  function validateForm() {
    // All mandatory except allergens and description
    if (!formData.name.trim()) return "Beverage name is required"
    if (!formData.category) return "Category is required"
    if (!formData.baseType.trim()) return "Base Type is required"
    if (formData.ingredients.length === 0) return "At least one ingredient is required"
    if (!formData.price) return "Price is required"
    if (!formData.sizeVol.trim()) return "Size/Volume is required"
    if (formData.flavorTags.length === 0) return "At least one flavor tag is required"
    if (!formData.photo && !selectedFile) return "Cover image is required"
    return null
  }

  async function submit() {
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }
    
    setLoading(true)
    try {
      // Upload image if selected
      let photoUrl = formData.photo || null
      if (selectedFile) {
        const urls = await uploadRestaurantFiles(restaurantId, [selectedFile])
        photoUrl = urls[0]
      }

      const payload = {
        name: formData.name,
        category: formData.category && formData.category.trim() ? formData.category : null,
        baseType: formData.baseType && formData.baseType.trim() ? formData.baseType : null,
        ingredients: formData.ingredients || [],
        allergens: formData.allergens || [],
        perfectPairing: formData.perfectPairing || [],
        price: formData.price ? parseFloat(formData.price) : null,
        sizeVol: formData.sizeVol && formData.sizeVol.trim() ? formData.sizeVol : null,
        isSignatureItem: formData.isSignatureItem || false,
        flavorTags: formData.flavorTags || [],
        description: formData.description && formData.description.trim() ? formData.description.trim() : null,
        photo: photoUrl
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
        name: "", category: "", baseType: "",
        ingredients: [], allergens: [], perfectPairing: [], price: "", sizeVol: "",
        isSignatureItem: false, flavorTags: [], description: "", photo: ""
      })
      setSelectedFile(null)
      setPairingInput("")
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

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 w-full">
      {/* Copy from Another Beverage - Only show when creating new beverage */}
      {!isEditing && (
        <div className="glass rounded-xl p-4 space-y-3 border border-amber-500/20">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Copy className="w-4 h-4 text-amber-500" />
            Copy from Another Beverage
          </div>
          {loadingBeverages ? (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading beverages...
            </div>
          ) : allBeverages.length > 0 ? (
            <>
              <div className="flex gap-2">
                <Select 
                  value={selectedBeverageToCopy} 
                  onValueChange={setSelectedBeverageToCopy}
                  disabled={copyingBeverage}
                >
                  <SelectTrigger className="glass border-white/20 text-white flex-1">
                    <SelectValue placeholder="Select a beverage..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/20 max-h-60">
                    {allBeverages.map(b => (
                      <SelectItem key={b.id} value={b.id} className="text-white hover:bg-white/10">
                        <div className="flex flex-col">
                          <span className="font-medium">{b.name}</span>
                          <span className="text-white/50 text-xs">{b.restaurantName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleCopyBeverage}
                  disabled={!selectedBeverageToCopy || copyingBeverage}
                  className="glass border-white/20 text-white hover:bg-white/10 px-4"
                  variant="outline"
                >
                  {copyingBeverage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Copying...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-white/40 text-xs">
                This will fill the form with the selected beverage's details. You can then modify and save.
              </p>
            </>
          ) : (
            <p className="text-white/40 text-sm">
              No beverages available to copy. Create your first beverage manually.
            </p>
          )}
        </div>
      )}

      {/* Name */}
      <div className="w-full">
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Wine className="w-4 h-4 text-amber-500" />
          Beverage Name *
        </label>
        <Input
          placeholder="Enter beverage name"
          value={formData.name}
          onChange={e => updateField("name", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-12 w-full"
        />
      </div>

      {/* Category (Alcoholic/Non-Alcoholic) */}
      <div className="w-full">
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-500" />
          Category <span className="text-red-400">*</span>
        </label>
        <Select value={formData.category} onValueChange={v => updateField("category", v)}>
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

      {/* Type / Style (now baseType) */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Beaker className="w-4 h-4 text-amber-500" />
          Base Type <span className="text-red-400">*</span>
        </label>
        <Input
          placeholder="e.g., Margarita, Espresso Martini..."
          value={formData.baseType}
          onChange={e => updateField("baseType", e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-10"
        />
      </div>

      {/* Price & Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-500" />
            Price (₹) <span className="text-red-400">*</span>
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
            Size / Volume (ml) <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            step="any"
            min="0"
            placeholder="e.g., 330"
            value={formData.sizeVol}
            onChange={e => {
              const val = e.target.value
              if (val === '' || !isNaN(parseFloat(val))) {
                updateField("sizeVol", val)
              } else {
                alert("Please enter a valid number for Size/Volume")
              }
            }}
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
        label="Ingredients *"
        icon={Beaker}
        value={ingredientInput}
        items={formData.ingredients}
        onInputChange={setIngredientInput}
        onAdd={() => addToArray("ingredients", ingredientInput, setIngredientInput)}
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
        onInputChange={setAllergenInput}
        onAdd={() => addToArray("allergens", allergenInput, setAllergenInput)}
        onRemove={(idx) => removeFromArray("allergens", idx)}
        placeholder="Add allergen and press Enter"
        color="red"
      />

      {/* Flavor Tags */}
      <TagInput
        label="Flavor Tags *"
        icon={Sparkles}
        value={flavorInput}
        items={formData.flavorTags}
        onInputChange={setFlavorInput}
        onAdd={() => addToArray("flavorTags", flavorInput, setFlavorInput)}
        onRemove={(idx) => removeFromArray("flavorTags", idx)}
        placeholder="e.g., Sweet, Sour, Spicy..."
        color="purple"
      />

      {/* Perfect Pairing */}
      <TagInput
        label="Perfect Pairing"
        icon={Utensils}
        value={pairingInput}
        items={formData.perfectPairing}
        onInputChange={setPairingInput}
        onAdd={() => addToArray("perfectPairing", pairingInput, setPairingInput)}
        onRemove={(idx) => removeFromArray("perfectPairing", idx)}
        placeholder="Best food to enjoy with this drink..."
        color="green"
      />

      {/* Cover Image */}
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Image className="w-4 h-4 text-amber-500" />
          Cover Image <span className="text-red-400">*</span>
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
              onFilesSelected={files => {
                const file = files[0]
                if (file && file.size > 1 * 1024 * 1024) {
                  alert(`Image "${file.name}" exceeds 1MB size limit (${(file.size / (1024 * 1024)).toFixed(2)}MB). Please compress or resize the image.`)
                  return
                }
                setSelectedFile(file || null)
              }}
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
