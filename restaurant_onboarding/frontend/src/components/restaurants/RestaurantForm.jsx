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
  Image, Link2, Phone, Building2, Shield, Landmark, Check, Plus, Clock, UtensilsCrossed, Mail, Globe, Save
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Basic Info", icon: Store },
  { id: 2, title: "Branding", icon: Image },
  { id: 3, title: "Legal", icon: Shield },
  { id: 4, title: "Operational", icon: FileText },
  { id: 5, title: "Menu", icon: UtensilsCrossed },
  { id: 6, title: "Social", icon: Link2 },
  { id: 7, title: "Financial", icon: Landmark },
]

// Mandatory steps that must be completed before submission
const MANDATORY_STEPS = [1, 2, 3, 4, 5] // Basic Info, Branding, Legal, Operational, Menu

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

// Check if closing time is before or equal to opening time (next day)
function isNextDayClosing(openTime, closeTime) {
  if (!openTime || !closeTime) return false
  return closeTime <= openTime
}

// Validation patterns for legal document numbers
const FSSAI_REGEX = /^\d{14}$/  // 14 digit number
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/  // Standard GST format
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/  // Standard PAN format

function validateFssaiNumber(value) {
  if (!value) return { valid: true, message: '' }
  const trimmed = value.trim()
  if (!FSSAI_REGEX.test(trimmed)) {
    return { valid: false, message: 'FSSAI number must be exactly 14 digits' }
  }
  return { valid: true, message: '' }
}

function validateGstNumber(value) {
  if (!value) return { valid: true, message: '' }
  const trimmed = value.trim().toUpperCase()
  if (!GST_REGEX.test(trimmed)) {
    return { valid: false, message: 'Invalid GST format (e.g., 22AAAAA0000A1Z5)' }
  }
  return { valid: true, message: '' }
}

function validatePanNumber(value) {
  if (!value) return { valid: true, message: '' }
  const trimmed = value.trim().toUpperCase()
  if (!PAN_REGEX.test(trimmed)) {
    return { valid: false, message: 'Invalid PAN format (e.g., ABCDE1234F)' }
  }
  return { valid: true, message: '' }
}

// Migrate old format to new timeSlots format if needed
function migrateToTimeSlots(hours) {
  if (!Array.isArray(hours)) return getDefaultOpeningHours()
  
  return hours.map(day => {
    // If already in new format (has timeSlots), return as-is
    if (day.timeSlots !== undefined) {
      return day
    }
    
    // Convert old format to new format
    return {
      day: day.day,
      isClosed: day.isClosed,
      timeSlots: day.isClosed ? [] : [{
        openTime: day.openTime,
        closeTime: day.closeTime
      }]
    }
  })
}

// Parse opening hours from JSON or return default
function parseOpeningHours(hoursData) {
  if (!hoursData) return getDefaultOpeningHours()
  if (typeof hoursData === 'string') {
    try {
      const parsed = JSON.parse(hoursData)
      return migrateToTimeSlots(parsed)
    } catch {
      return getDefaultOpeningHours()
    }
  }
  return migrateToTimeSlots(hoursData)
}

// Parse location from various formats (object, string, WKB hex, null)
function parseLocation(locationData) {
  if (!locationData) return null
  
  // Already a valid object with lat/lng
  if (typeof locationData === 'object' && 
      typeof locationData.lat === 'number' && 
      typeof locationData.lng === 'number') {
    return locationData
  }
  
  // Try parsing as JSON string
  if (typeof locationData === 'string') {
    try {
      const parsed = JSON.parse(locationData)
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed
      }
    } catch {
      // Not valid JSON, try WKB hex format
      const wkbResult = parseWkbHexToLatLng(locationData)
      if (wkbResult) return wkbResult
    }
  }
  
  return null
}

// Parse WKB hex format to {lat, lng} (PostGIS geography format)
function parseWkbHexToLatLng(wkbHex) {
  if (!wkbHex || typeof wkbHex !== 'string' || wkbHex.length < 50) return null
  
  try {
    // WKB Point with SRID format - coordinates start at position 18
    const coordsHex = wkbHex.substring(18)
    if (coordsHex.length < 32) return null
    
    const lngHex = coordsHex.substring(0, 16)
    const latHex = coordsHex.substring(16, 32)
    
    const lng = parseHexToDouble(lngHex)
    const lat = parseHexToDouble(latHex)
    
    if (isNaN(lat) || isNaN(lng)) return null
    return { lat, lng }
  } catch {
    return null
  }
}

// Parse 16-char hex string to IEEE 754 double (little-endian)
function parseHexToDouble(hex) {
  const bytes = []
  for (let i = 0; i < 16; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  bytes.forEach((b, i) => view.setUint8(i, b))
  return view.getFloat64(0, true)
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
  const [savingProgress, setSavingProgress] = useState(false)
  const [savingNextStep, setSavingNextStep] = useState(false)
  const [saveStatus, setSaveStatus] = useState("idle") // "idle" | "saved" | "unsaved"
  const [createdRestaurantId, setCreatedRestaurantId] = useState(editRestaurant?.id || null)

  // Step 1: Basic Info
  const [name, setName] = useState(editRestaurant?.name || "")
  const [bio, setBio] = useState(editRestaurant?.bio || "")
  const [phone, setPhone] = useState(editRestaurant?.phone || "")
  const [address, setAddress] = useState(editRestaurant?.address || "")
  const [websiteUrl, setWebsiteUrl] = useState(editRestaurant?.websiteurl || "")
  const [contactEmail, setContactEmail] = useState(editRestaurant?.contactemail || "")
  const [location, setLocation] = useState(parseLocation(editRestaurant?.location))
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
  const [fssaicertificate, setFssaiCertificate] = useState(
    // Handle both array (new) and single string (legacy) formats
    Array.isArray(editLegalInfo?.fssaicertificate) 
      ? editLegalInfo.fssaicertificate 
      : editLegalInfo?.fssaicertificate 
        ? [editLegalInfo.fssaicertificate] 
        : []
  )
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

  // Validation error states
  const [fssaiError, setFssaiError] = useState('')
  const [gstError, setGstError] = useState('')
  const [panError, setPanError] = useState('')

  // Menu documents
  const [menuFiles, setMenuFiles] = useState([])
  const [foodMenuPics, setFoodMenuPics] = useState(editRestaurant?.foodMenuPics || [])

  // Reset save status to "idle" when any form field changes (after initial save)
  useEffect(() => {
    if (saveStatus === "saved") {
      setSaveStatus("idle")
    }
  }, [
    name, bio, phone, address, websiteUrl, contactEmail, location,
    logoFiles, logoImage, coverFiles, coverImage, galleryFiles, gallery,
    cuisineTags, amenities, priceRange, hasReservation, reservationLink, openingHours, hasAlcohol,
    instaLink, facebookLink, twitterLink, googleMapsLink,
    fssailicensenumber, fssaiCertFiles, fssaicertificate, gstnumber, gstCertFiles, gstcertificate,
    pannumber, panImageFiles, panimage, bbmpLicenseFiles, bbmptradelicense, liquorLicenseFiles, liquorlicense,
    accountnumber, ifsccode, menuFiles, foodMenuPics
  ])

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
    if (!contactEmail.trim()) {
      alert("Contact email is required")
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      alert("Please enter a valid email address")
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

  // Check if mandatory fields are filled for a step (without alerts) - for green tick indicator
  function isStepComplete(step) {
    switch (step) {
      case 1: // Basic Info
        return name.trim() && bio.trim() && phone.trim() && contactEmail.trim() && address.trim() && 
               location && typeof location.lat === 'number' && typeof location.lng === 'number'
      case 2: // Branding
        return (logoImage || logoFiles.length > 0) && (coverImage || coverFiles.length > 0) && 
               (gallery.length > 0 || galleryFiles.length > 0)
      case 3: // Legal
        return fssailicensenumber.trim() && (fssaicertificate.length > 0 || fssaiCertFiles.length > 0) &&
               gstnumber.trim() && (gstcertificate || gstCertFiles.length > 0) &&
               pannumber.trim() && (panimage || panImageFiles.length > 0) &&
               (bbmptradelicense || bbmpLicenseFiles.length > 0) &&
               (!hasAlcohol || (liquorlicense || liquorLicenseFiles.length > 0))
      case 4: // Operational
        return cuisineTags.length > 0 && amenities.length > 0 && priceRange && openingHours.some(day => !day.isClosed)
      case 5: // Menu
        return foodMenuPics.length > 0 || menuFiles.length > 0
      default:
        return true
    }
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
    // Check if at least one day has at least one time slot
    const hasOpenDay = openingHours.some(day => !day.isClosed && day.timeSlots.length > 0)
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
    const fssaiValidation = validateFssaiNumber(fssailicensenumber)
    if (!fssaiValidation.valid) {
      alert(fssaiValidation.message)
      setFssaiError(fssaiValidation.message)
      return false
    }
    if (fssaicertificate.length === 0 && fssaiCertFiles.length === 0) {
      alert("FSSAI Certificate is required")
      return false
    }
    if (!gstnumber.trim()) {
      alert("GST Number is required")
      return false
    }
    const gstValidation = validateGstNumber(gstnumber)
    if (!gstValidation.valid) {
      alert(gstValidation.message)
      setGstError(gstValidation.message)
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
    const panValidation = validatePanNumber(pannumber)
    if (!panValidation.valid) {
      alert(panValidation.message)
      setPanError(panValidation.message)
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
      case 3: return validateLegal()
      case 4: return validateDetails()
      case 5: return validateMenu()
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
        websiteurl: websiteUrl,
        contactemail: contactEmail,
        ...(finalLocation?.lat && finalLocation?.lng ? { location: finalLocation } : {})
      }

      if (isEditMode || restaurantId) {
        await updateRestaurant(restaurantId, basicPayload)
      } else {
        const restaurant = await createRestaurant(basicPayload)
        restaurantId = restaurant.id
        setCreatedRestaurantId(restaurantId)
      }

      // Step 2: Upload branding images in parallel
      let newLogoUrl = logoImage
      let newCoverUrl = coverImage
      let newGalleryUrls = [...gallery]
      let newMenuPics = [...foodMenuPics]

      const brandingUploads = []

      if (logoFiles.length > 0) {
        brandingUploads.push(
          uploadSingleFile(restaurantId, logoFiles[0], "logo").then(url => {
            newLogoUrl = url
            setLogoImage(url)
          })
        )
      }
      if (coverFiles.length > 0) {
        brandingUploads.push(
          uploadSingleFile(restaurantId, coverFiles[0], "cover").then(url => {
            newCoverUrl = url
            setCoverImage(url)
          })
        )
      }
      if (galleryFiles.length > 0) {
        brandingUploads.push(
          uploadRestaurantFiles(restaurantId, galleryFiles, "gallery").then(uploadedGallery => {
            newGalleryUrls = [...newGalleryUrls, ...uploadedGallery]
            setGallery(newGalleryUrls)
          })
        )
      }
      if (menuFiles.length > 0) {
        brandingUploads.push(
          uploadRestaurantFiles(restaurantId, menuFiles, "menus").then(uploadedMenus => {
            newMenuPics = [...newMenuPics, ...uploadedMenus]
            setFoodMenuPics(newMenuPics)
          })
        )
      }

      // Wait for all branding uploads to complete
      if (brandingUploads.length > 0) {
        await Promise.all(brandingUploads)
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
        googleMapsLink,
        iscomplete: true // Final submit means all mandatory fields are validated
      })
      onRestaurantUpdated?.(updated)

      // Step 5: Legal info - upload documents in parallel
      let newFssaiCerts = [...fssaicertificate]
      let newGstCert = gstcertificate
      let newPanImg = panimage
      let newBbmpLic = bbmptradelicense
      let newLiquorLic = liquorlicense

      const legalUploads = []

      if (fssaiCertFiles.length > 0) {
        legalUploads.push(
          Promise.all(fssaiCertFiles.map(file => uploadSingleFile(restaurantId, file, "legal/fssai"))).then(uploadedFssaiCerts => {
            newFssaiCerts = [...newFssaiCerts, ...uploadedFssaiCerts]
            setFssaiCertificate(newFssaiCerts)
          })
        )
      }
      if (gstCertFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, gstCertFiles[0], "legal/gst").then(url => {
            newGstCert = url
            setGstCertificate(url)
          })
        )
      }
      if (panImageFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, panImageFiles[0], "legal/pan").then(url => {
            newPanImg = url
            setPanImage(url)
          })
        )
      }
      if (bbmpLicenseFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, bbmpLicenseFiles[0], "legal/bbmp").then(url => {
            newBbmpLic = url
            setBbmpTradeLicense(url)
          })
        )
      }
      if (hasAlcohol && liquorLicenseFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, liquorLicenseFiles[0], "legal/liquor").then(url => {
            newLiquorLic = url
            setLiquorLicense(url)
          })
        )
      }

      // Wait for all legal uploads to complete
      if (legalUploads.length > 0) {
        await Promise.all(legalUploads)
      }

      await updateLegalInfo(restaurantId, {
        fssailicensenumber,
        fssaicertificate: newFssaiCerts,
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

  // Check if all mandatory steps are complete (for isComplete field)
  function areAllMandatoryStepsComplete() {
    return MANDATORY_STEPS.every(step => isStepComplete(step))
  }

  // Core save logic - returns true if saved successfully, false otherwise
  async function performSave(options = { silent: false }) {
    // Must have at least a name to save
    if (!name.trim()) {
      if (!options.silent) {
        alert("Please enter at least a restaurant name to save progress")
      }
      return false
    }

    try {
      let finalLocation = location
      if (finalLocation && typeof finalLocation.lat !== 'number') {
        finalLocation = null
      }

      let restaurantId = createdRestaurantId

      // Check if all mandatory steps are complete
      const isComplete = areAllMandatoryStepsComplete()

      // Create or update basic info
      const basicPayload = {
        name,
        bio: bio || null,
        phone: phone || null,
        address: address || null,
        websiteurl: websiteUrl || null,
        contactemail: contactEmail || null,
        iscomplete: isComplete,
        ...(finalLocation?.lat && finalLocation?.lng ? { location: finalLocation } : {})
      }

      if (isEditMode || restaurantId) {
        await updateRestaurant(restaurantId, basicPayload)
      } else {
        const restaurant = await createRestaurant(basicPayload)
        restaurantId = restaurant.id
        setCreatedRestaurantId(restaurantId)
      }

      // Upload branding files in parallel for better performance
      let newLogoUrl = logoImage
      let newCoverUrl = coverImage
      let newGalleryUrls = [...gallery]
      let newMenuPics = [...foodMenuPics]

      const brandingUploads = []
      
      if (logoFiles.length > 0) {
        brandingUploads.push(
          uploadSingleFile(restaurantId, logoFiles[0], "logo").then(url => {
            newLogoUrl = url
            setLogoImage(url)
            setLogoFiles([])
          })
        )
      }
      if (coverFiles.length > 0) {
        brandingUploads.push(
          uploadSingleFile(restaurantId, coverFiles[0], "cover").then(url => {
            newCoverUrl = url
            setCoverImage(url)
            setCoverFiles([])
          })
        )
      }
      if (galleryFiles.length > 0) {
        brandingUploads.push(
          uploadRestaurantFiles(restaurantId, galleryFiles, "gallery").then(uploadedGallery => {
            newGalleryUrls = [...newGalleryUrls, ...uploadedGallery]
            setGallery(newGalleryUrls)
            setGalleryFiles([])
          })
        )
      }
      if (menuFiles.length > 0) {
        brandingUploads.push(
          uploadRestaurantFiles(restaurantId, menuFiles, "menus").then(uploadedMenus => {
            newMenuPics = [...newMenuPics, ...uploadedMenus]
            setFoodMenuPics(newMenuPics)
            setMenuFiles([])
          })
        )
      }

      // Wait for all branding uploads to complete in parallel
      if (brandingUploads.length > 0) {
        await Promise.all(brandingUploads)
      }

      // Update restaurant with all current data
      await updateRestaurant(restaurantId, {
        logoImage: newLogoUrl,
        coverImage: newCoverUrl,
        gallery: newGalleryUrls,
        cuisineTags: cuisineTags.length > 0 ? cuisineTags : null,
        amenities: amenities.length > 0 ? amenities : null,
        priceRange: priceRange ? priceRangeToDb(priceRange) : null,
        hasReservation,
        reservationLink: hasReservation ? reservationLink : null,
        openingHours: JSON.stringify(openingHours),
        foodMenuPics: newMenuPics,
        hasAlcohol,
        instaLink: instaLink || null,
        facebookLink: facebookLink || null,
        twitterLink: twitterLink || null,
        googleMapsLink: googleMapsLink || null,
        iscomplete: isComplete
      })

      // Upload legal documents in parallel for better performance
      let newFssaiCerts = [...fssaicertificate]
      let newGstCert = gstcertificate
      let newPanImg = panimage
      let newBbmpLic = bbmptradelicense
      let newLiquorLic = liquorlicense

      const legalUploads = []

      if (fssaiCertFiles.length > 0) {
        legalUploads.push(
          Promise.all(fssaiCertFiles.map(file => uploadSingleFile(restaurantId, file, "legal/fssai"))).then(uploadedFssaiCerts => {
            newFssaiCerts = [...newFssaiCerts, ...uploadedFssaiCerts]
            setFssaiCertificate(newFssaiCerts)
            setFssaiCertFiles([])
          })
        )
      }
      if (gstCertFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, gstCertFiles[0], "legal/gst").then(url => {
            newGstCert = url
            setGstCertificate(url)
            setGstCertFiles([])
          })
        )
      }
      if (panImageFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, panImageFiles[0], "legal/pan").then(url => {
            newPanImg = url
            setPanImage(url)
            setPanImageFiles([])
          })
        )
      }
      if (bbmpLicenseFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, bbmpLicenseFiles[0], "legal/bbmp").then(url => {
            newBbmpLic = url
            setBbmpTradeLicense(url)
            setBbmpLicenseFiles([])
          })
        )
      }
      if (hasAlcohol && liquorLicenseFiles.length > 0) {
        legalUploads.push(
          uploadSingleFile(restaurantId, liquorLicenseFiles[0], "legal/liquor").then(url => {
            newLiquorLic = url
            setLiquorLicense(url)
            setLiquorLicenseFiles([])
          })
        )
      }

      // Wait for all legal uploads to complete in parallel
      if (legalUploads.length > 0) {
        await Promise.all(legalUploads)
      }

      // Save legal info if any fields are filled
      if (fssailicensenumber || newFssaiCerts.length > 0 || gstnumber || newGstCert || pannumber || newPanImg || newBbmpLic || newLiquorLic) {
        await updateLegalInfo(restaurantId, {
          fssailicensenumber: fssailicensenumber || null,
          fssaicertificate: newFssaiCerts,
          gstnumber: gstnumber || null,
          gstcertificate: newGstCert,
          pannumber: pannumber || null,
          panimage: newPanImg,
          bbmptradelicense: newBbmpLic,
          liquorlicense: hasAlcohol ? newLiquorLic : null
        })
      }

      // Save bank details if any fields are filled
      if (accountnumber || ifsccode) {
        await updateBankDetails(restaurantId, {
          accountnumber: accountnumber || null,
          ifsccode: ifsccode || null
        })
      }

      onRestaurantUpdated?.({ id: restaurantId, iscomplete: isComplete })
      return true
    } catch (err) {
      console.error(err)
      if (!options.silent) {
        alert("Failed to save progress. Please try again.")
      }
      return false
    }
  }

  // Save progress without requiring all mandatory fields
  async function handleSaveProgress() {
    setSavingProgress(true)
    try {
      const success = await performSave({ silent: false })
      if (success) {
        setSaveStatus("saved")
      }
    } finally {
      setSavingProgress(false)
    }
  }

  // Handle next step navigation with auto-save
  async function handleNextStep() {
    // Validate current step if it's mandatory
    if (MANDATORY_STEPS.includes(currentStep) && !validateStep(currentStep)) {
      return
    }
    
    // Auto-save silently if restaurant name is provided
    if (name.trim()) {
      setSavingNextStep(true)
      try {
        await performSave({ silent: true })
        setSaveStatus("saved")
      } finally {
        setSavingNextStep(false)
      }
    }
    
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Update opening hours for a specific day
  // Add a new time slot to a specific day
  function addTimeSlot(dayIndex) {
    const newHours = [...openingHours]
    newHours[dayIndex].timeSlots.push({ openTime: "09:00", closeTime: "22:00" })
    setOpeningHours(newHours)
  }

  // Remove a time slot from a specific day
  function removeTimeSlot(dayIndex, slotIndex) {
    const newHours = [...openingHours]
    newHours[dayIndex].timeSlots.splice(slotIndex, 1)
    setOpeningHours(newHours)
  }

  // Update a specific time slot
  function updateTimeSlot(dayIndex, slotIndex, field, value) {
    const newHours = [...openingHours]
    newHours[dayIndex].timeSlots[slotIndex][field] = value
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
                <Mail className="w-4 h-4 text-amber-500" />
                Contact Email <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                placeholder="contact@yourrestaurant.com"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 h-12 w-full"
              />
            </div>

            <div className="w-full">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                Website URL
              </label>
              <Input
                type="url"
                placeholder="https://www.yourrestaurant.com"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
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
                  <FileDropzone maxFiles={1} accept={{ "image/*": [] }} files={logoFiles} onFilesSelected={setLogoFiles} />
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
                  <FileDropzone maxFiles={1} accept={{ "image/*": [] }} files={coverFiles} onFilesSelected={setCoverFiles} />
                </div>
              )}
            </div>

            <div className="w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Gallery Images <span className="text-red-400">*</span>
              </label>
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
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
                <FileDropzone maxFiles={5} existingCount={gallery.length} accept={{ "image/*": [] }} files={galleryFiles} onFilesSelected={setGalleryFiles} />
              </div>
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
          </div>
        )

      case 4:
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

            <div>
              <label className="text-sm text-white/80 mb-3 block flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Opening Hours <span className="text-red-400">*</span>
              </label>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block glass rounded-xl border border-white/20 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-xs text-white/60 p-3 font-medium">Day</th>
                      <th className="text-left text-xs text-white/60 p-3 font-medium">Time Slots</th>
                      <th className="text-center text-xs text-white/60 p-3 font-medium">Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openingHours.map((dayInfo, dayIdx) => (
                      <tr key={dayInfo.day} className={dayIdx < openingHours.length - 1 ? "border-b border-white/5" : ""}>
                        <td className="p-3 text-white/80 text-sm font-medium align-top">{dayInfo.day}</td>
                        <td className="p-3 space-y-2">
                          {!dayInfo.isClosed && dayInfo.timeSlots.map((slot, slotIdx) => {
                            const showNextDay = isNextDayClosing(slot.openTime, slot.closeTime)
                            return (
                              <div key={slotIdx} className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={slot.openTime}
                                  onChange={e => updateTimeSlot(dayIdx, slotIdx, "openTime", e.target.value)}
                                  className="glass border-white/20 text-white h-9 w-28 text-sm"
                                />
                                <span className="text-white/40">-</span>
                                <Input
                                  type="time"
                                  value={slot.closeTime}
                                  onChange={e => updateTimeSlot(dayIdx, slotIdx, "closeTime", e.target.value)}
                                  className="glass border-white/20 text-white h-9 w-28 text-sm"
                                />
                                {showNextDay && (
                                  <span className="text-amber-400 text-xs font-semibold bg-amber-500/20 px-1.5 py-0.5 rounded" title="Closes next day">
                                    +1
                                  </span>
                                )}
                                {dayInfo.timeSlots.length > 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeTimeSlot(dayIdx, slotIdx)}
                                    className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/20"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                          {!dayInfo.isClosed && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => addTimeSlot(dayIdx)}
                              className="h-7 text-amber-400 hover:bg-amber-500/20 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Slot
                            </Button>
                          )}
                          {dayInfo.isClosed && (
                            <span className="text-red-400/80 text-sm">Closed</span>
                          )}
                        </td>
                        <td className="p-3 text-center align-top">
                          <Checkbox
                            checked={dayInfo.isClosed}
                            onCheckedChange={checked => {
                              const newHours = [...openingHours]
                              newHours[dayIdx].isClosed = checked
                              if (checked) {
                                newHours[dayIdx].timeSlots = []
                              } else if (newHours[dayIdx].timeSlots.length === 0) {
                                newHours[dayIdx].timeSlots = [{ openTime: "09:00", closeTime: "22:00" }]
                              }
                              setOpeningHours(newHours)
                            }}
                            className="border-white/30 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-2">
                {openingHours.map((dayInfo, dayIdx) => (
                  <div key={dayInfo.day} className="glass rounded-xl border border-white/20 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{dayInfo.day}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs">Closed</span>
                        <Checkbox
                          checked={dayInfo.isClosed}
                          onCheckedChange={checked => {
                            const newHours = [...openingHours]
                            newHours[dayIdx].isClosed = checked
                            if (checked) {
                              newHours[dayIdx].timeSlots = []
                            } else if (newHours[dayIdx].timeSlots.length === 0) {
                              newHours[dayIdx].timeSlots = [{ openTime: "09:00", closeTime: "22:00" }]
                            }
                            setOpeningHours(newHours)
                          }}
                          className="border-white/30 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                        />
                      </div>
                    </div>
                    {!dayInfo.isClosed && (
                      <div className="space-y-2">
                        {dayInfo.timeSlots.map((slot, slotIdx) => {
                          const showNextDay = isNextDayClosing(slot.openTime, slot.closeTime)
                          return (
                            <div key={slotIdx} className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-white/50 text-xs mb-1 block">Open</label>
                                  <Input
                                    type="time"
                                    value={slot.openTime}
                                    onChange={e => updateTimeSlot(dayIdx, slotIdx, "openTime", e.target.value)}
                                    className="glass border-white/20 text-white h-9 text-sm w-full"
                                  />
                                </div>
                                <div>
                                  <label className="text-white/50 text-xs mb-1 block flex items-center gap-1">
                                    Close
                                    {showNextDay && (
                                      <span className="text-amber-400 text-xs font-semibold bg-amber-500/20 px-1 py-0.5 rounded" title="Closes next day">
                                        +1
                                      </span>
                                    )}
                                  </label>
                                  <Input
                                    type="time"
                                    value={slot.closeTime}
                                    onChange={e => updateTimeSlot(dayIdx, slotIdx, "closeTime", e.target.value)}
                                    className="glass border-white/20 text-white h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                              {dayInfo.timeSlots.length > 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTimeSlot(dayIdx, slotIdx)}
                                  className="w-full h-8 text-red-400 hover:bg-red-500/20 text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Remove Slot {slotIdx + 1}
                                </Button>
                              )}
                            </div>
                          )
                        })}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addTimeSlot(dayIdx)}
                          className="w-full h-8 text-amber-400 hover:bg-amber-500/20 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Time Slot
                        </Button>
                      </div>
                    )}
                    {dayInfo.isClosed && (
                      <div className="text-red-400/80 text-xs text-center py-2">Closed on this day</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
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
                <FileDropzone maxFiles={5} existingCount={foodMenuPics.length} accept={{ "image/*": [], "application/pdf": [] }} files={menuFiles} onFilesSelected={setMenuFiles} />
              </div>
            </div>
          </div>
        )

      case 6:
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

      case 3:
        return (
          <div className="space-y-5 w-full overflow-hidden">
            <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-3 block font-medium">FSSAI License <span className="text-red-400">*</span></label>
              <Input
                placeholder="14 digit license number"
                value={fssailicensenumber}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 14)
                  setFssaiLicenseNumber(val)
                  // Only show error when full length is entered
                  if (val.length === 14) {
                    const validation = validateFssaiNumber(val)
                    setFssaiError(!validation.valid ? validation.message : '')
                  } else {
                    setFssaiError('')
                  }
                }}
                className={`glass border-white/20 text-white placeholder:text-white/40 h-10 mb-1 w-full ${fssaiError ? 'border-red-500' : ''}`}
              />
              {fssaiError && <p className="text-red-400 text-xs mb-2">{fssaiError}</p>}
              {!fssaiError && <div className="mb-2" />}
              {/* Display existing FSSAI certificates */}
              {fssaicertificate.length > 0 && (
                <div className="space-y-2 mb-3">
                  {fssaicertificate.map((certUrl, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-white/80 text-sm flex-1 truncate min-w-0">Certificate {idx + 1}</span>
                      <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(certUrl, "_blank")}>Open</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setFssaiCertificate(fssaicertificate.filter((_, i) => i !== idx))}><X className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
              )}
              {/* FileDropzone handles disabling when max files reached */}
              <FileDropzone 
                maxFiles={5} 
                existingCount={fssaicertificate.length}
                accept={{ "image/*": [], "application/pdf": [] }} 
                files={fssaiCertFiles}
                onFilesSelected={setFssaiCertFiles} 
              />
            </div>

            <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-3 block font-medium">GST Registration <span className="text-red-400">*</span></label>
              <Input
                placeholder="e.g., 22AAAAA0000A1Z5"
                value={gstnumber}
                onChange={e => {
                  const val = e.target.value.toUpperCase().slice(0, 15)
                  setGstNumber(val)
                  // Only show error when full length is entered
                  if (val.length === 15) {
                    const validation = validateGstNumber(val)
                    setGstError(!validation.valid ? validation.message : '')
                  } else {
                    setGstError('')
                  }
                }}
                className={`glass border-white/20 text-white placeholder:text-white/40 h-10 mb-1 w-full ${gstError ? 'border-red-500' : ''}`}
              />
              {gstError && <p className="text-red-400 text-xs mb-2">{gstError}</p>}
              {!gstError && <div className="mb-2" />}
              {gstcertificate ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm flex-1 truncate min-w-0">Certificate uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(gstcertificate, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setGstCertificate(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} files={gstCertFiles} onFilesSelected={setGstCertFiles} />
              )}
            </div>

            <div className="glass rounded-xl p-4 border border-white/20 w-full overflow-hidden">
              <label className="text-sm text-white/80 mb-3 block font-medium">PAN Card <span className="text-red-400">*</span></label>
              <Input
                placeholder="e.g., ABCDE1234F"
                value={pannumber}
                onChange={e => {
                  const val = e.target.value.toUpperCase().slice(0, 10)
                  setPanNumber(val)
                  // Only show error when full length is entered
                  if (val.length === 10) {
                    const validation = validatePanNumber(val)
                    setPanError(!validation.valid ? validation.message : '')
                  } else {
                    setPanError('')
                  }
                }}
                className={`glass border-white/20 text-white placeholder:text-white/40 h-10 mb-1 w-full ${panError ? 'border-red-500' : ''}`}
              />
              {panError && <p className="text-red-400 text-xs mb-2">{panError}</p>}
              {!panError && <div className="mb-2" />}
              {panimage ? (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-full overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm flex-1 truncate min-w-0">PAN image uploaded</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white/60 flex-shrink-0" onClick={() => window.open(panimage, "_blank")}>Open</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-red-400 flex-shrink-0" onClick={() => setPanImage(null)}><X className="w-3 h-3" /></Button>
                </div>
              ) : (
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} files={panImageFiles} onFilesSelected={setPanImageFiles} />
              )}
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
                <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} files={bbmpLicenseFiles} onFilesSelected={setBbmpLicenseFiles} />
              )}
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
                  <FileDropzone maxFiles={1} accept={{ "image/*": [], "application/pdf": [] }} files={liquorLicenseFiles} onFilesSelected={setLiquorLicenseFiles} />
                )}
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
            // Show green tick only if step is before current AND mandatory fields are complete
            const isCompleted = step.id < currentStep && isStepComplete(step.id)
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
      <div className="flex flex-wrap gap-3 pt-2">
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

        {/* Save Progress Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveProgress}
          disabled={savingProgress || loading}
          className={`glass border-white/20 text-white h-12 rounded-xl hover:bg-white/10 ${saveStatus === "saved" ? "border-green-500/50 text-green-400" : ""}`}
        >
          {saveStatus === "saved" ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {savingProgress ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save Progress"}
        </Button>

        {currentStep < 7 ? (
          <Button
            onClick={handleNextStep}
            disabled={savingNextStep}
            className="flex-1 gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {savingNextStep ? "Saving..." : "Next Step"}
            {!savingNextStep && <ChevronRight className="w-4 h-4 ml-1" />}
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
