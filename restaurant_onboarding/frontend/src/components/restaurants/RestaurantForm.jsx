import { useState, useEffect } from "react"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { getCurrentLocation } from "../../utils/getCurrentLocation"
import { updateRestaurant, updateLegalInfo, updateBankDetails } from "../../api/restaurants"
import { supabase } from "../../supabaseClient"
import FileDropzone from "../common/FileDropzone"
import MapPicker from "../common/MapPicker"
import UploadedFiles from "../common/UploadedFiles"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Store, FileText, MapPin, Upload, X, ChevronRight, ChevronLeft,
  Image, Link2, Phone, Building2, Shield, Landmark, Check, Plus
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Basic Info", icon: Store },
  { id: 2, title: "Branding", icon: Image },
  { id: 3, title: "Details", icon: FileText },
  { id: 4, title: "Social", icon: Link2 },
  { id: 5, title: "Legal", icon: Shield },
  { id: 6, title: "Bank", icon: Landmark },
]

const CUISINE_OPTIONS = [
  "Italian", "Indian", "Chinese", "Japanese", "Mexican", "Thai",
  "French", "Mediterranean", "American", "Korean", "Vietnamese",
  "Greek", "Spanish", "Middle Eastern", "Caribbean", "African"
]

const AMENITY_OPTIONS = [
  "WiFi", "Parking", "Outdoor Seating", "Live Music", "Pet Friendly",
  "Wheelchair Accessible", "Private Dining", "Bar", "Rooftop",
  "Air Conditioning", "Valet Parking", "Kids Play Area"
]

// Price range: display string <-> database integer
const PRICE_RANGE_OPTIONS = [
  { display: "$", value: 1 },
  { display: "$$", value: 2 },
  { display: "$$$", value: 3 },
  { display: "$$$$", value: 4 }
]

function priceRangeToDisplay(dbValue) {
  const found = PRICE_RANGE_OPTIONS.find(p => p.value === dbValue)
  return found ? found.display : "$$"
}

function priceRangeToDb(displayValue) {
  const found = PRICE_RANGE_OPTIONS.find(p => p.display === displayValue)
  return found ? found.value : 2
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
    editRestaurant?.priceRange ? priceRangeToDisplay(editRestaurant.priceRange) : "$$"
  )
  const [hasReservation, setHasReservation] = useState(editRestaurant?.hasReservation || false)
  const [reservationLink, setReservationLink] = useState(editRestaurant?.reservationLink || "")
  const [openingHours, setOpeningHours] = useState(editRestaurant?.openingHours || "")

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

  // Step 1: Create or update basic restaurant
  async function handleBasicInfoSave() {
    if (!name.trim()) {
      alert("Restaurant name is required")
      return false
    }

    setLoading(true)
    try {
      // Only include location if it has valid coordinates
      let finalLocation = null
      if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
        finalLocation = location
      } else {
        // Try to get current location
        try {
          finalLocation = await getCurrentLocation()
        } catch (e) {
          // Location not available, that's ok
        }
      }

      const payload = {
        name,
        bio,
        phone,
        address
      }
      
      // Only include location if valid
      if (finalLocation && finalLocation.lat && finalLocation.lng) {
        payload.location = finalLocation
      }

      if (isEditMode || createdRestaurantId) {
        const updated = await updateRestaurant(createdRestaurantId, payload)
        onRestaurantUpdated?.(updated)
      } else {
        const restaurant = await onCreate(payload)
        setCreatedRestaurantId(restaurant.id)
        onRestaurantUpdated?.(restaurant)
      }
      return true
    } catch (err) {
      console.error(err)
      alert("Failed to save basic info")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Upload branding images
  async function handleBrandingSave() {
    if (!createdRestaurantId) {
      alert("Please complete step 1 first")
      return false
    }

    setLoading(true)
    try {
      let newLogoUrl = logoImage
      let newCoverUrl = coverImage
      let newGalleryUrls = [...gallery]

      if (logoFiles.length > 0) {
        newLogoUrl = await uploadSingleFile(createdRestaurantId, logoFiles[0], "logo")
        setLogoImage(newLogoUrl)
      }

      if (coverFiles.length > 0) {
        newCoverUrl = await uploadSingleFile(createdRestaurantId, coverFiles[0], "cover")
        setCoverImage(newCoverUrl)
      }

      if (galleryFiles.length > 0) {
        const uploadedGallery = await uploadRestaurantFiles(createdRestaurantId, galleryFiles, "gallery")
        newGalleryUrls = [...newGalleryUrls, ...uploadedGallery]
        setGallery(newGalleryUrls)
      }

      const updated = await updateRestaurant(createdRestaurantId, {
        logoImage: newLogoUrl,
        coverImage: newCoverUrl,
        gallery: newGalleryUrls
      })
      onRestaurantUpdated?.(updated)

      setLogoFiles([])
      setCoverFiles([])
      setGalleryFiles([])

      return true
    } catch (err) {
      console.error(err)
      alert("Failed to save branding")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Save details
  async function handleDetailsSave() {
    if (!createdRestaurantId) {
      alert("Please complete step 1 first")
      return false
    }

    setLoading(true)
    try {
      let newMenuPics = [...foodMenuPics]
      if (menuFiles.length > 0) {
        const uploadedMenus = await uploadRestaurantFiles(createdRestaurantId, menuFiles, "menus")
        newMenuPics = [...newMenuPics, ...uploadedMenus]
        setFoodMenuPics(newMenuPics)
      }

      const updated = await updateRestaurant(createdRestaurantId, {
        cuisineTags,
        amenities,
        priceRange: priceRangeToDb(priceRange),
        hasReservation,
        reservationLink: hasReservation ? reservationLink : null,
        openingHours,
        foodMenuPics: newMenuPics
      })
      onRestaurantUpdated?.(updated)
      setMenuFiles([])
      return true
    } catch (err) {
      console.error(err)
      alert("Failed to save details")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Save social links
  async function handleSocialSave() {
    if (!createdRestaurantId) {
      alert("Please complete step 1 first")
      return false
    }

    setLoading(true)
    try {
      const updated = await updateRestaurant(createdRestaurantId, {
        instaLink,
        facebookLink,
        twitterLink,
        googleMapsLink
      })
      onRestaurantUpdated?.(updated)
      return true
    } catch (err) {
      console.error(err)
      alert("Failed to save social links")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Save legal info
  async function handleLegalSave() {
    if (!createdRestaurantId) {
      alert("Please complete step 1 first")
      return false
    }

    setLoading(true)
    try {
      let newFssaiCert = fssaicertificate
      let newGstCert = gstcertificate
      let newPanImg = panimage
      let newBbmpLic = bbmptradelicense

      if (fssaiCertFiles.length > 0) {
        newFssaiCert = await uploadSingleFile(createdRestaurantId, fssaiCertFiles[0], "legal/fssai")
        setFssaiCertificate(newFssaiCert)
      }
      if (gstCertFiles.length > 0) {
        newGstCert = await uploadSingleFile(createdRestaurantId, gstCertFiles[0], "legal/gst")
        setGstCertificate(newGstCert)
      }
      if (panImageFiles.length > 0) {
        newPanImg = await uploadSingleFile(createdRestaurantId, panImageFiles[0], "legal/pan")
        setPanImage(newPanImg)
      }
      if (bbmpLicenseFiles.length > 0) {
        newBbmpLic = await uploadSingleFile(createdRestaurantId, bbmpLicenseFiles[0], "legal/bbmp")
        setBbmpTradeLicense(newBbmpLic)
      }

      await updateLegalInfo(createdRestaurantId, {
        fssailicensenumber,
        fssaicertificate: newFssaiCert,
        gstnumber,
        gstcertificate: newGstCert,
        pannumber,
        panimage: newPanImg,
        bbmptradelicense: newBbmpLic
      })

      setFssaiCertFiles([])
      setGstCertFiles([])
      setPanImageFiles([])
      setBbmpLicenseFiles([])

      return true
    } catch (err) {
      console.error(err)
      alert("Failed to save legal info")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Step 6: Save bank details
  async function handleBankSave() {
    if (!createdRestaurantId) {
      alert("Please complete step 1 first")
      return false
    }

    setLoading(true)
    try {
      await updateBankDetails(createdRestaurantId, {
        accountnumber,
        ifsccode
      })
      return true
    } catch (err) {
      console.error(err)
      alert("Failed to save bank details")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Save current step and move to next
  async function handleSaveAndContinue() {
    let success = false

    switch (currentStep) {
      case 1:
        success = await handleBasicInfoSave()
        break
      case 2:
        success = await handleBrandingSave()
        break
      case 3:
        success = await handleDetailsSave()
        break
      case 4:
        success = await handleSocialSave()
        break
      case 5:
        success = await handleLegalSave()
        break
      case 6:
        success = await handleBankSave()
        break
    }

    if (success && currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else if (success && currentStep === 6) {
      // Close the form automatically on completion
      onComplete?.()
    }
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
          <div className="space-y-5">
            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-500" />
                Restaurant Name *
              </label>
              <Input
                placeholder="Enter restaurant name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Description
              </label>
              <Textarea
                placeholder="Tell us about your restaurant..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                Phone Number
              </label>
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                Address
              </label>
              <Textarea
                placeholder="Full address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Location
              </label>
              <div className="glass rounded-xl p-3 border border-white/20">
                <MapPicker value={location} onChange={setLocation} />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Logo Image
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
                <div className="glass rounded-xl p-4 border border-white/20">
                  <FileDropzone maxFiles={1} accept={{ "image/*": [] }} onFilesSelected={setLogoFiles} />
                  {logoFiles.length > 0 && <p className="text-white/60 text-sm mt-2">{logoFiles[0].name}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Cover Image
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
                <div className="glass rounded-xl p-4 border border-white/20">
                  <FileDropzone maxFiles={1} accept={{ "image/*": [] }} onFilesSelected={setCoverFiles} />
                  {coverFiles.length > 0 && <p className="text-white/60 text-sm mt-2">{coverFiles[0].name}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Gallery Images
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
              <div className="glass rounded-xl p-4 border border-white/20">
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
              <label className="text-sm text-white/80 mb-2 block">Cuisine Types</label>
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
              <label className="text-sm text-white/80 mb-2 block">Amenities</label>
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
              <label className="text-sm text-white/80 mb-2 block">Price Range</label>
              <div className="flex gap-2">
                {["$", "$$", "$$$", "$$$$"].map(range => (
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

            <div>
              <label className="text-sm text-white/80 mb-2 block">Opening Hours</label>
              <Textarea
                placeholder="Mon-Fri: 11am-10pm&#10;Sat-Sun: 10am-11pm"
                value={openingHours}
                onChange={e => setOpeningHours(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
              />
            </div>

            <div>
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                Menu / Documents
              </label>
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

      case 4:
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

      case 5:
        return (
          <div className="space-y-5">
            <div className="glass rounded-xl p-4 border border-white/20">
              <label className="text-sm text-white/80 mb-3 block font-medium">FSSAI License</label>
              <Input
                placeholder="License Number"
                value={fssailicensenumber}
                onChange={e => setFssaiLicenseNumber(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-10 mb-3"
              />
              {fssaicertificate ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="text-white/80 text-sm flex-1 truncate">Certificate uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60" onClick={() => window.open(fssaicertificate, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400" onClick={() => setFssaiCertificate(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setFssaiCertFiles} />
              )}
              {fssaiCertFiles.length > 0 && <p className="text-white/60 text-xs mt-1">{fssaiCertFiles[0].name}</p>}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20">
              <label className="text-sm text-white/80 mb-3 block font-medium">GST Registration</label>
              <Input
                placeholder="GST Number"
                value={gstnumber}
                onChange={e => setGstNumber(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-10 mb-3"
              />
              {gstcertificate ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="text-white/80 text-sm flex-1 truncate">Certificate uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60" onClick={() => window.open(gstcertificate, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400" onClick={() => setGstCertificate(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setGstCertFiles} />
              )}
              {gstCertFiles.length > 0 && <p className="text-white/60 text-xs mt-1">{gstCertFiles[0].name}</p>}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20">
              <label className="text-sm text-white/80 mb-3 block font-medium">PAN Card</label>
              <Input
                placeholder="PAN Number"
                value={pannumber}
                onChange={e => setPanNumber(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-10 mb-3"
              />
              {panimage ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="text-white/80 text-sm flex-1 truncate">PAN image uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60" onClick={() => window.open(panimage, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400" onClick={() => setPanImage(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setPanImageFiles} />
              )}
              {panImageFiles.length > 0 && <p className="text-white/60 text-xs mt-1">{panImageFiles[0].name}</p>}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20">
              <label className="text-sm text-white/80 mb-3 block font-medium">BBMP Trade License</label>
              {bbmptradelicense ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="text-white/80 text-sm flex-1 truncate">License uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60" onClick={() => window.open(bbmptradelicense, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400" onClick={() => setBbmpTradeLicense(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} onFilesSelected={setBbmpLicenseFiles} />
              )}
              {bbmpLicenseFiles.length > 0 && <p className="text-white/60 text-xs mt-1">{bbmpLicenseFiles[0].name}</p>}
            </div>
          </div>
        )

      case 6:
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
    <div className="space-y-5">
      {/* Step Indicator */}
      <div className="glass rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {STEPS.map((step) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            const isAccessible = isEditMode || createdRestaurantId || step.id === 1

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && setCurrentStep(step.id)}
                disabled={!isAccessible}
                className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? "gradient-amber text-black"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className={`text-xs ${isActive ? "text-amber-400" : "text-white/50"}`}>
                  {step.title}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">{renderStepContent()}</div>

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

        <Button
          onClick={handleSaveAndContinue}
          disabled={loading}
          className="flex-1 gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90 transition-opacity"
        >
          {loading ? "Saving..." : currentStep === 6 ? "Complete Setup" : "Save & Continue"}
          {!loading && currentStep < 6 && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  )
}
