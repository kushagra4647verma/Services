import { useState, useEffect } from "react"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { getCurrentLocation } from "../../utils/getCurrentLocation"
import { createRestaurant, updateRestaurant, updateLegalInfo, updateBankDetails } from "../../api/restaurants"
import { supabase } from "../../supabaseClient"
import FileDropzone from "../common/FileDropzone"
import MapPicker from "../common/MapPicker"
import UploadedFiles from "../common/UploadedFiles"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CUISINE_OPTIONS, AMENITY_OPTIONS, getDefaultOpeningHours } from "../../config/restaurantOptions"
import {
  Store, FileText, MapPin, Upload, X, ChevronRight, ChevronLeft,
  Image, Link2, Phone, Building2, Shield, Landmark, Check, Plus, Clock, UtensilsCrossed
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Basic Info", icon: Store },
  { id: 2, title: "Branding", icon: Image },
  { id: 3, title: "Details", icon: FileText },
  { id: 4, title: "Menu", icon: UtensilsCrossed },
  { id: 5, title: "Social", icon: Link2 },
  { id: 6, title: "Legal", icon: Shield },
  { id: 7, title: "Bank", icon: Landmark },
]

// Mandatory steps that must be completed before submission
const MANDATORY_STEPS = [1, 2, 3, 4, 6] // Basic Info, Branding, Details, Menu, Legal

// Price range: display string <-> database integer
const PRICE_RANGE_OPTIONS = [
  { display: "₹", value: 1 },
  { display: "₹₹", value: 2 },
  { display: "₹₹₹", value: 3 },
  { display: "₹₹₹₹", value: 4 }
]

function priceRangeToDisplay(dbValue) {
  const found = PRICE_RANGE_OPTIONS.find(p => p.value === dbValue)
  return found ? found.display : "₹₹"
}

function priceRangeToDb(displayValue) {
  const found = PRICE_RANGE_OPTIONS.find(p => p.display === displayValue)
  return found ? found.value : 2
}

// Parse opening hours from JSON or return default
function parseOpeningHours(hoursData) {
  if (!hoursData) return getDefaultOpeningHours()
  if (typeof hoursData === 'string') {
    try {
      return JSON.parse(hoursData)
    } catch {
      return getDefaultOpeningHours()
    }
  }
  return hoursData
}

export default function RestaurantForm({
  onCreate,
  onRestaurantUpdated,
  onCancel,
  onComplete,
  editRestaurant = null,
  editLegalInfo = null,
  editBankDetails = null
}) {
  const isEditMode = !!editRestaurant

  if (!isEditMode && typeof onCreate !== "function") {
    throw new Error("RestaurantForm requires onCreate prop for create mode")
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [createdRestaurantId, setCreatedRestaurantId] = useState(editRestaurant?.id || null)

  // Step 1: Basic Info
  const [name, setName] = useState(editRestaurant?.name || "")
  const [bio, setBio] = useState(editRestaurant?.bio || "")
  const [phone, setPhone] = useState(editRestaurant?.phone || "")
  const [address, setAddress] = useState(editRestaurant?.address || "")
  const [location, setLocation] = useState(editRestaurant?.location || null)
  const [locationError, setLocationError] = useState(false)

  // Get current location on mount if not in edit mode
  useEffect(() => {
    if (!isEditMode && !location) {
      getCurrentLocation()
        .then(loc => {
          setLocation(loc)
          setLocationError(false)
        })
        .catch((err) => {
          setLocationError(true)
          alert("Location access is required. Please enable location services in your browser settings and refresh the page.")
        })
    }
  }, [])

  // Step 2: Branding
  const [logoFiles, setLogoFiles] = useState([])
  const [logoImage, setLogoImage] = useState(editRestaurant?.logoImage || null)
  const [coverFiles, setCoverFiles] = useState([])
  const [coverImage, setCoverImage] = useState(editRestaurant?.coverImage || null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [gallery, setGallery] = useState(editRestaurant?.gallery || [])

  // Step 3: Details
  const [cuisineTags, setCuisineTags] = useState(editRestaurant?.cuisineTags || [])
  const [amenities, setAmenities] = useState(editRestaurant?.amenities || [])
  const [priceRange, setPriceRange] = useState(
    editRestaurant?.priceRange ? priceRangeToDisplay(editRestaurant.priceRange) : "₹₹"
  )
  const [hasReservation, setHasReservation] = useState(editRestaurant?.hasReservation || false)
  const [reservationLink, setReservationLink] = useState(editRestaurant?.reservationLink || "")
  const [openingHours, setOpeningHours] = useState(parseOpeningHours(editRestaurant?.openingHours))
  const [hasAlcohol, setHasAlcohol] = useState(editRestaurant?.hasAlcohol || false)

  // Step 4: Social Links
  const [instaLink, setInstaLink] = useState(editRestaurant?.instaLink || "")
  const [facebookLink, setFacebookLink] = useState(editRestaurant?.facebookLink || "")
  const [twitterLink, setTwitterLink] = useState(editRestaurant?.twitterLink || "")
  const [googleMapsLink, setGoogleMapsLink] = useState(editRestaurant?.googleMapsLink || "")

  // Step 5: Legal Info (lowercase as per DB schema)
  const [fssailicensenumber, setFssaiLicenseNumber] = useState(editLegalInfo?.fssailicensenumber || "")
  const [fssaiCertFiles, setFssaiCertFiles] = useState([])
  const [fssaicertificate, setFssaiCertificate] = useState(editLegalInfo?.fssaicertificate || null)
  const [gstnumber, setGstNumber] = useState(editLegalInfo?.gstnumber || "")
  const [gstCertFiles, setGstCertFiles] = useState([])
  const [gstcertificate, setGstCertificate] = useState(editLegalInfo?.gstcertificate || null)
  const [pannumber, setPanNumber] = useState(editLegalInfo?.pannumber || "")
  const [panImageFiles, setPanImageFiles] = useState([])
  const [panimage, setPanImage] = useState(editLegalInfo?.panimage || null)
  const [bbmpLicenseFiles, setBbmpLicenseFiles] = useState([])
  const [bbmptradelicense, setBbmpTradeLicense] = useState(editLegalInfo?.bbmptradelicense || null)
  const [liquorLicenseFiles, setLiquorLicenseFiles] = useState([])
  const [liquorlicense, setLiquorLicense] = useState(editLegalInfo?.liquorlicense || null)

  // Step 6: Bank Details
  const [accountnumber, setAccountNumber] = useState(editBankDetails?.accountnumber || "")
  const [ifsccode, setIfscCode] = useState(editBankDetails?.ifsccode || "")

  // Menu documents
  const [menuFiles, setMenuFiles] = useState([])
  const [foodMenuPics, setFoodMenuPics] = useState(editRestaurant?.foodMenuPics || [])

  // Upload helper
  async function uploadSingleFile(restaurantId, file, folder) {
    const fileExt = file.name.split(".").pop()
    const filePath = `restaurants/${restaurantId}/${folder}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from("test2")
      .upload(filePath, file, { upsert: true })

    if (error) throw error

    const { data } = supabase.storage
      .from("test2")
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Validation functions for each step
  function validateBasicInfo() {
    if (!name.trim()) {
      alert("Restaurant name is required")
      return false
    }
    if (!bio.trim()) {
      alert("Description is required")
      return false
    }
    if (!phone.trim()) {
      alert("Phone number is required")
      return false
    }
    if (!address.trim()) {
      alert("Address is required")
      return false
    }
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      alert("Location is required. Please select a location on the map.")
      return false
    }
    return true
  }

  function validateBranding() {
    if (!logoImage && logoFiles.length === 0) {
      alert("Logo image is required")
      return false
    }
    if (!coverImage && coverFiles.length === 0) {
      alert("Cover image is required")
      return false
    }
    if (gallery.length === 0 && galleryFiles.length === 0) {
      alert("At least one gallery image is required")
      return false
    }
    return true
  }

  function validateDetails() {
    if (cuisineTags.length === 0) {
      alert("Please select at least one cuisine type")
      return false
    }
    if (amenities.length === 0) {
      alert("Please select at least one amenity")
      return false
    }
    if (!priceRange) {
      alert("Please select a price range")
      return false
    }
    // Check if at least one day has opening hours
    const hasOpenDay = openingHours.some(day => !day.isClosed)
    if (!hasOpenDay) {
      alert("At least one day must have opening hours")
      return false
    }
    return true
  }

  function validateMenu() {
    if (foodMenuPics.length === 0 && menuFiles.length === 0) {
      alert("Food menu is required")
      return false
    }
    return true
  }

  function validateLegal() {
    if (!fssailicensenumber.trim()) {
      alert("FSSAI License Number is required")
      return false
    }
    if (!fssaicertificate && fssaiCertFiles.length === 0) {
      alert("FSSAI Certificate is required")
      return false
    }
    if (!gstnumber.trim()) {
      alert("GST Number is required")
      return false
    }
    if (!gstcertificate && gstCertFiles.length === 0) {
      alert("GST Certificate is required")
      return false
    }
    if (!pannumber.trim()) {
      alert("PAN Number is required")
      return false
    }
    if (!panimage && panImageFiles.length === 0) {
      alert("PAN Card image is required")
      return false
    }
    if (!bbmptradelicense && bbmpLicenseFiles.length === 0) {
      alert("BBMP Trade License is required")
      return false
    }
    // Liquor license is required only if restaurant serves alcohol
    if (hasAlcohol && !liquorlicense && liquorLicenseFiles.length === 0) {
      alert("Liquor License is required when serving alcohol")
      return false
    }
    return true
  }

  // Validate current step before proceeding
  function validateStep(step) {
    switch (step) {
      case 1: return validateBasicInfo()
      case 2: return validateBranding()
      case 3: return validateDetails()
      case 4: return validateMenu()
      case 6: return validateLegal()
      default: return true
    }
  }

  // Final submission - creates/updates restaurant with all data
  async function handleFinalSubmit() {
    // Validate all mandatory steps
    for (const step of MANDATORY_STEPS) {
      if (!validateStep(step)) {
        setCurrentStep(step)
        return
      }
    }

    setLoading(true)
    try {
      // Get location if needed
      let finalLocation = location
      if (!finalLocation || typeof finalLocation.lat !== 'number') {
        try {
          finalLocation = await getCurrentLocation()
        } catch (e) {
          // Location not available
        }
      }

      let restaurantId = createdRestaurantId

      // Step 1: Create or update basic info
      const basicPayload = {
        name,
        bio,
        phone,
        address,
        ...(finalLocation?.lat && finalLocation?.lng ? { location: finalLocation } : {})
      }

      if (isEditMode || restaurantId) {
        await updateRestaurant(restaurantId, basicPayload)
      } else {
        const restaurant = await createRestaurant(basicPayload)
        restaurantId = restaurant.id
        setCreatedRestaurantId(restaurantId)
      }

      // Step 2: Upload branding images
      let newLogoUrl = logoImage
      let newCoverUrl = coverImage
      let newGalleryUrls = [...gallery]

      if (logoFiles.length > 0) {
        newLogoUrl = await uploadSingleFile(restaurantId, logoFiles[0], "logo")
        setLogoImage(newLogoUrl)
      }
      if (coverFiles.length > 0) {
        newCoverUrl = await uploadSingleFile(restaurantId, coverFiles[0], "cover")
        setCoverImage(newCoverUrl)
      }
      if (galleryFiles.length > 0) {
        const uploadedGallery = await uploadRestaurantFiles(restaurantId, galleryFiles, "gallery")
        newGalleryUrls = [...newGalleryUrls, ...uploadedGallery]
        setGallery(newGalleryUrls)
      }

      // Step 3: Details & menu
      let newMenuPics = [...foodMenuPics]
      if (menuFiles.length > 0) {
        const uploadedMenus = await uploadRestaurantFiles(restaurantId, menuFiles, "menus")
        newMenuPics = [...newMenuPics, ...uploadedMenus]
        setFoodMenuPics(newMenuPics)
      }

      // Update restaurant with all details
      const updated = await updateRestaurant(restaurantId, {
        logoImage: newLogoUrl,
        coverImage: newCoverUrl,
        gallery: newGalleryUrls,
        cuisineTags,
        amenities,
        priceRange: priceRangeToDb(priceRange),
        hasReservation,
        reservationLink: hasReservation ? reservationLink : null,
        openingHours: JSON.stringify(openingHours),
        foodMenuPics: newMenuPics,
        hasAlcohol,
        instaLink,
        facebookLink,
        twitterLink,
        googleMapsLink
      })
      onRestaurantUpdated?.(updated)

      // Step 5: Legal info
      let newFssaiCert = fssaicertificate
      let newGstCert = gstcertificate
      let newPanImg = panimage
      let newBbmpLic = bbmptradelicense
      let newLiquorLic = liquorlicense

      if (fssaiCertFiles.length > 0) {
        newFssaiCert = await uploadSingleFile(restaurantId, fssaiCertFiles[0], "legal/fssai")
        setFssaiCertificate(newFssaiCert)
      }
      if (gstCertFiles.length > 0) {
        newGstCert = await uploadSingleFile(restaurantId, gstCertFiles[0], "legal/gst")
        setGstCertificate(newGstCert)
      }
      if (panImageFiles.length > 0) {
        newPanImg = await uploadSingleFile(restaurantId, panImageFiles[0], "legal/pan")
        setPanImage(newPanImg)
      }
      if (bbmpLicenseFiles.length > 0) {
        newBbmpLic = await uploadSingleFile(restaurantId, bbmpLicenseFiles[0], "legal/bbmp")
        setBbmpTradeLicense(newBbmpLic)
      }
      if (hasAlcohol && liquorLicenseFiles.length > 0) {
        newLiquorLic = await uploadSingleFile(restaurantId, liquorLicenseFiles[0], "legal/liquor")
        setLiquorLicense(newLiquorLic)
      }

      await updateLegalInfo(restaurantId, {
        fssailicensenumber,
        fssaicertificate: newFssaiCert,
        gstnumber,
        gstcertificate: newGstCert,
        pannumber,
        panimage: newPanImg,
        bbmptradelicense: newBbmpLic,
        liquorlicense: hasAlcohol ? newLiquorLic : null
      })

      // Step 6: Bank details
      if (accountnumber || ifsccode) {
        await updateBankDetails(restaurantId, {
          accountnumber,
          ifsccode
        })
      }

      // Clear all file states
      setLogoFiles([])
      setCoverFiles([])
      setGalleryFiles([])
      setMenuFiles([])
      setFssaiCertFiles([])
      setGstCertFiles([])
      setPanImageFiles([])
      setBbmpLicenseFiles([])

      onComplete?.()
    } catch (err) {
      console.error(err)
      alert("Failed to create restaurant. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle next step navigation
  function handleNextStep() {
    // Validate current step if it's mandatory
    if (MANDATORY_STEPS.includes(currentStep) && !validateStep(currentStep)) {
      return
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Update opening hours for a specific day
  function updateOpeningHoursDay(dayIndex, field, value) {
    const newHours = [...openingHours]
    newHours[dayIndex] = { ...newHours[dayIndex], [field]: value }
    setOpeningHours(newHours)
  }

  // Tag toggle helpers
  function toggleTag(tag, tags, setTags) {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  // Delete uploaded file helper
  async function handleDeleteFile(url, currentValue, setValue, isArray = false) {
    if (!confirm("Delete this file?")) return

    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/test2/")
      if (pathParts.length > 1) {
        const filePath = decodeURIComponent(pathParts[1])
        await supabase.storage.from("test2").remove([filePath])
      }

      if (isArray) {
        const newValue = currentValue.filter(f => f !== url)
        setValue(newValue)
        if (createdRestaurantId) {
          await updateRestaurant(createdRestaurantId, { gallery: newValue })
        }
      } else {
        setValue(null)
      }
    } catch (err) {
      console.error("Failed to delete file:", err)
    }
  }

  // Render step content
  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5 w-full overflow-hidden">
            <div className="w-full">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-500" />
                Restaurant Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="Enter restaurant name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12 w-full"
              />
            </div>

            <div className="w-full">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Description <span className="text-red-400">*</span>
              </label>
              <Textarea
                placeholder="Tell us about your restaurant..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[100px] w-full"
              />
            </div>

            <div className="w-full">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                Phone Number <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12 w-full"
              />
            </div>

            <div className="w-full">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Address <span className="text-red-400">*</span>
              </label>
              <Textarea
                placeholder="Full address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[80px] w-full"
              />
            </div>

            <div className="w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Location <span className="text-red-400">*</span>
              </label>
              <div className="glass rounded-xl p-3 border border-white/20 w-full overflow-hidden">
                <MapPicker value={location} onChange={setLocation} />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5 w-full overflow-hidden">
            <div className="w-full">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Logo Image <span className="text-red-400">*</span>
              </label>
              {logoImage ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/20">
                  <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      onClick={() => window.open(logoImage, "_blank")}
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                      onClick={() => handleDeleteFile(logoImage, logoImage, setLogoImage)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
                  <FileDropzone maxFiles={1} accept={{ "image/*": [] }} onFilesSelected={setLogoFiles} />
                  {logoFiles.length > 0 && <p className="text-white/60 text-sm mt-2 truncate">{logoFiles[0].name}</p>}
                </div>
              )}
            </div>

            <div className="w-full">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Cover Image <span className="text-red-400">*</span>
              </label>
              {coverImage ? (
                <div className="relative h-32 rounded-xl overflow-hidden border border-white/20">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => window.open(coverImage, "_blank")}>
                      <Link2 className="w-4 h-4 mr-1" /> Open
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20" onClick={() => handleDeleteFile(coverImage, coverImage, setCoverImage)}>
                      <X className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
                  <FileDropzone maxFiles={1} accept={{ "image/*": [] }} onFilesSelected={setCoverFiles} />
                  {coverFiles.length > 0 && <p className="text-white/60 text-sm mt-2 truncate">{coverFiles[0].name}</p>}
                </div>
              )}
            </div>

            <div className="w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Gallery Images <span className="text-red-400">*</span>
              </label>
              {gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {gallery.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/20">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 text-red-400 hover:bg-red-500/20"
                        onClick={() => handleDeleteFile(url, gallery, setGallery, true)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
                <FileDropzone maxFiles={5} accept={{ "image/*": [] }} onFilesSelected={setGalleryFiles} />
                {galleryFiles.length > 0 && <p className="text-white/60 text-sm mt-2">{galleryFiles.length} new image(s) selected</p>}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Cuisine Types <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {CUISINE_OPTIONS.map(cuisine => (
                  <Badge
                    key={cuisine}
                    variant={cuisineTags.includes(cuisine) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      cuisineTags.includes(cuisine)
                        ? "bg-amber-500 text-black hover:bg-amber-600"
                        : "border-white/20 text-white/60 hover:bg-white/10"
                    }`}
                    onClick={() => toggleTag(cuisine, cuisineTags, setCuisineTags)}
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Amenities <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {AMENITY_OPTIONS.map(amenity => (
                  <Badge
                    key={amenity}
                    variant={amenities.includes(amenity) ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      amenities.includes(amenity)
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : "border-white/20 text-white/60 hover:bg-white/10"
                    }`}
                    onClick={() => toggleTag(amenity, amenities, setAmenities)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block">Price Range <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                {["₹", "₹₹", "₹₹₹", "₹₹₹₹"].map(range => (
                  <Button
                    key={range}
                    variant={priceRange === range ? "default" : "outline"}
                    className={`flex-1 ${
                      priceRange === range
                        ? "gradient-amber text-black"
                        : "glass border-white/20 text-white hover:bg-white/10"
                    }`}
                    onClick={() => setPriceRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-white/80">Accept Reservations</label>
                <Switch checked={hasReservation} onCheckedChange={setHasReservation} />
              </div>
              {hasReservation && (
                <Input
                  placeholder="Reservation link (e.g., OpenTable URL)"
                  value={reservationLink}
                  onChange={e => setReservationLink(e.target.value)}
                  className="glass border-white/20 text-white placeholder:text-white/40 h-10"
                />
              )}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-white/80">Serves Alcohol</label>
                  <p className="text-white/50 text-xs">Liquor license will be required in Legal section</p>
                </div>
                <Switch checked={hasAlcohol} onCheckedChange={setHasAlcohol} />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/80 mb-3 block flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Opening Hours <span className="text-red-400">*</span>
              </label>
              <div className="glass rounded-xl border border-white/20 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-white/60 p-3 font-medium">Day</th>
                      <th className="text-left text-xs text-white/60 p-3 font-medium">Open</th>
                      <th className="text-left text-xs text-white/60 p-3 font-medium">Close</th>
                      <th className="text-center text-xs text-white/60 p-3 font-medium">Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openingHours.map((dayInfo, idx) => (
                      <tr key={dayInfo.day} className={idx < openingHours.length - 1 ? "border-b border-white/5" : ""}>
                        <td className="p-3 text-white/80 text-sm font-medium">{dayInfo.day}</td>
                        <td className="p-2">
                          <Input
                            type="time"
                            value={dayInfo.openTime}
                            onChange={e => updateOpeningHoursDay(idx, "openTime", e.target.value)}
                            disabled={dayInfo.isClosed}
                            className={`glass border-white/20 text-white h-9 w-28 text-sm ${dayInfo.isClosed ? "opacity-50" : ""}`}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="time"
                            value={dayInfo.closeTime}
                            onChange={e => updateOpeningHoursDay(idx, "closeTime", e.target.value)}
                            disabled={dayInfo.isClosed}
                            className={`glass border-white/20 text-white h-9 w-28 text-sm ${dayInfo.isClosed ? "opacity-50" : ""}`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={dayInfo.isClosed}
                            onCheckedChange={checked => updateOpeningHoursDay(idx, "isClosed", checked)}
                            className="border-white/30 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                Food Menu <span className="text-red-400">*</span>
              </label>
              <p className="text-white/50 text-sm mb-3">Upload images or PDF of your restaurant menu</p>
              {foodMenuPics.length > 0 && (
                <UploadedFiles files={foodMenuPics} restaurantId={createdRestaurantId} onFilesUpdated={setFoodMenuPics} />
              )}
              <div className="glass rounded-xl p-4 border border-white/20 mt-2">
                <FileDropzone maxFiles={5} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setMenuFiles} />
                {menuFiles.length > 0 && <p className="text-white/60 text-sm mt-2">{menuFiles.length} file(s) selected</p>}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <span className="text-pink-500">📸</span> Instagram
              </label>
              <Input
                placeholder="https://instagram.com/yourrestaurant"
                value={instaLink}
                onChange={e => setInstaLink(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <span className="text-blue-500">📘</span> Facebook
              </label>
              <Input
                placeholder="https://facebook.com/yourrestaurant"
                value={facebookLink}
                onChange={e => setFacebookLink(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <span className="text-sky-400">🐦</span> Twitter / X
              </label>
              <Input
                placeholder="https://twitter.com/yourrestaurant"
                value={twitterLink}
                onChange={e => setTwitterLink(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <span className="text-green-500">📍</span> Google Maps
              </label>
              <Input
                placeholder="https://maps.google.com/..."
                value={googleMapsLink}
                onChange={e => setGoogleMapsLink(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-5 w-full overflow-hidden">
            <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-3 block font-medium">FSSAI License <span className="text-red-400">*</span></label>
              <Input
                placeholder="License Number"
                value={fssailicensenumber}
                onChange={e => setFssaiLicenseNumber(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-10 mb-3 w-full"
              />
              {fssaicertificate ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm flex-1 truncate min-w-0">Certificate uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(fssaicertificate, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setFssaiCertificate(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setFssaiCertFiles} />
              )}
              {fssaiCertFiles.length > 0 && <p className="text-white/60 text-xs mt-1 truncate">{fssaiCertFiles[0].name}</p>}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-3 block font-medium">GST Registration <span className="text-red-400">*</span></label>
              <Input
                placeholder="GST Number"
                value={gstnumber}
                onChange={e => setGstNumber(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-10 mb-3 w-full"
              />
              {gstcertificate ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm flex-1 truncate min-w-0">Certificate uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(gstcertificate, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setGstCertificate(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setGstCertFiles} />
              )}
              {gstCertFiles.length > 0 && <p className="text-white/60 text-xs mt-1 truncate">{gstCertFiles[0].name}</p>}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-3 block font-medium">PAN Card <span className="text-red-400">*</span></label>
              <Input
                placeholder="PAN Number"
                value={pannumber}
                onChange={e => setPanNumber(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-10 mb-3 w-full"
              />
              {panimage ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm flex-1 truncate min-w-0">PAN image uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(panimage, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setPanImage(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setPanImageFiles} />
              )}
              {panImageFiles.length > 0 && <p className="text-white/60 text-xs mt-1 truncate">{panImageFiles[0].name}</p>}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-3 block font-medium">BBMP Trade License <span className="text-red-400">*</span></label>
              {bbmptradelicense ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm flex-1 truncate min-w-0">License uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(bbmptradelicense, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setBbmpTradeLicense(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setBbmpLicenseFiles} />
              )}
              {bbmpLicenseFiles.length > 0 && <p className="text-white/60 text-xs mt-1 truncate">{bbmpLicenseFiles[0].name}</p>}
            </div>

            {hasAlcohol && (
              <div className="glass rounded-xl p-4 border border-amber-500/40 w-full overflow-hidden">
                <label className="text-sm text-white/80 mb-3 block font-medium">Liquor License <span className="text-red-400">*</span></label>
                <p className="text-amber-400/80 text-xs mb-3">Required because restaurant serves alcohol</p>
                {liquorlicense ? (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                    <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-white/80 text-sm flex-1 truncate min-w-0">License uploaded</span>
                    <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(liquorlicense, "_blank")}>Open</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setLiquorLicense(null)}><X className="w-3 h-3" /></Button>
                  </div>
                ) : (
                  <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setLiquorLicenseFiles} />
                )}
                {liquorLicenseFiles.length > 0 && <p className="text-white/60 text-xs mt-1 truncate">{liquorLicenseFiles[0].name}</p>}
              </div>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-5">
            <div className="glass rounded-xl p-5 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-amber flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Bank Account Details</h4>
                  <p className="text-white/50 text-sm">For receiving payments</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Account Number</label>
                  <Input
                    placeholder="Enter account number"
                    value={accountnumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/80 mb-2 block">IFSC Code</label>
                  <Input
                    placeholder="e.g., SBIN0001234"
                    value={ifsccode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5">
              <p className="text-amber-400 text-sm">
                💡 Bank details are securely stored and used only for payment processing.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-5 w-full overflow-hidden">
      {/* Step Indicator */}
      <div className="glass rounded-xl p-4 border border-white/20 overflow-hidden">
        <div className="flex items-center justify-between overflow-x-auto pb-2 -mb-2">
          {STEPS.map((step) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            const isMandatory = MANDATORY_STEPS.includes(step.id)

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[60px] transition-all cursor-pointer"
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "gradient-amber text-black"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <span className={`text-[10px] sm:text-xs ${isActive ? "text-amber-400" : "text-white/50"}`}>
                  {step.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px] w-full overflow-hidden">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="glass border-white/20 text-white h-12 rounded-xl hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}

        {onCancel && currentStep === 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="glass border-white/20 text-white h-12 rounded-xl hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}

        {currentStep < 7 ? (
          <Button
            onClick={handleNextStep}
            className="flex-1 gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90 transition-opacity"
          >
            Next Step
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleFinalSubmit}
            disabled={loading}
            className="flex-1 gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90 transition-opacity"
          >
            {loading ? "Creating Restaurant..." : "Submit"}
            {!loading && <Check className="w-4 h-4 ml-1" />}
          </Button>
        )}
      </div>
    </div>
  )
}
