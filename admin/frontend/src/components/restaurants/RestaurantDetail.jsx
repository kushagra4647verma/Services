import { useState, useEffect } from "react"
import BeverageList from "../beverages/BeverageList"
import EventList from "../events/EventList"
import { getLegalInfo, getBankDetails, updateVerificationStatus } from "../../api/restaurants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Store, MapPin, Phone, Clock, DollarSign, Image, ExternalLink, Mail, Globe,
  FileText, Building, CreditCard, User, Calendar, Shield, CheckCircle, XCircle,
  AlertTriangle, Link2, UtensilsCrossed, Landmark, Wine
} from "lucide-react"

// Step configurations matching the onboarding form
const STEPS = [
  { id: 1, title: "Basic Info", icon: Store },
  { id: 2, title: "Branding", icon: Image },
  { id: 3, title: "Legal", icon: Shield },
  { id: 4, title: "Operational", icon: FileText },
  { id: 5, title: "Menu", icon: UtensilsCrossed },
  { id: 6, title: "Social", icon: Link2 },
  { id: 7, title: "Financial", icon: Landmark },
]

// Convert database integer to display string
function formatPriceRange(value) {
  const map = { 1: "₹", 2: "₹₹", 3: "₹₹₹", 4: "₹₹₹₹" }
  return map[value] || null
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

// Format time from 24h to 12h format
function formatTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

// Parse and format opening hours JSON
function parseOpeningHours(hoursData) {
  if (!hoursData) return null
  try {
    const hours = typeof hoursData === 'string' ? JSON.parse(hoursData) : hoursData
    if (Array.isArray(hours)) return hours
    return null
  } catch {
    return null
  }
}

// Parse location from various formats
function parseLocation(locationData) {
  if (!locationData) return null
  
  if (typeof locationData === 'object' && 
      typeof locationData.lat === 'number' && 
      typeof locationData.lng === 'number') {
    return locationData
  }
  
  if (typeof locationData === 'string') {
    try {
      const parsed = JSON.parse(locationData)
      if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed
      }
    } catch {
      // Try WKB hex format
      const wkbResult = parseWkbHexToLatLng(locationData)
      if (wkbResult) return wkbResult
    }
  }
  
  return null
}

// Parse WKB hex format to {lat, lng}
function parseWkbHexToLatLng(wkbHex) {
  if (!wkbHex || typeof wkbHex !== 'string' || wkbHex.length < 50) return null
  
  try {
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

export default function RestaurantDetail({ restaurant, onRestaurantUpdated }) {
  const [legalInfo, setLegalInfo] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const parsedLocation = parseLocation(restaurant.location)

  useEffect(() => {
    if (restaurant?.id) {
      loadExtraInfo()
    }
  }, [restaurant?.id])

  async function loadExtraInfo() {
    setLoading(true)
    try {
      const [legal, bank] = await Promise.all([
        getLegalInfo(restaurant.id).catch(() => null),
        getBankDetails(restaurant.id).catch(() => null)
      ])
      setLegalInfo(legal)
      setBankDetails(bank)
    } catch (err) {
      console.error("Failed to load extra info:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerificationChange() {
    setVerifying(true)
    try {
      const newStatus = !restaurant.isVerified
      const updated = await updateVerificationStatus(restaurant.id, newStatus)
      onRestaurantUpdated?.(updated)
      setShowVerifyDialog(false)
    } catch (err) {
      console.error("Failed to update verification:", err)
      alert("Failed to update verification status")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Incomplete Warning Banner */}
      {restaurant.iscomplete === false && (
        <div className="glass rounded-xl p-4 border border-amber-500/40 bg-amber-500/10 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-400 font-medium">⚠️ Restaurant Form Incomplete</p>
            <p className="text-amber-400/80 text-sm">This restaurant has not completed all required fields in the restaurant onboarding form. </p>
          </div>
          <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-xs">
            Pending Completion
          </Badge>
        </div>
      )}

      {/* Restaurant Header with Cover */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-40 w-full relative">
          {restaurant.coverImage ? (
            <>
              <img
                src={restaurant.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <div className="text-center">
                <Image className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-white/30 text-xs mt-1">No cover image</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo or Icon */}
            {restaurant.logoImage ? (
              <img
                src={restaurant.logoImage}
                alt="Logo"
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/10 border border-dashed border-white/20 flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-white/30" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-white text-2xl font-bold truncate">{restaurant.name || <span className="text-white/30 italic">Unnamed Restaurant</span>}</h2>
                  {restaurant.iscomplete === false && (
                    <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-xs mt-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Incomplete
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVerifyDialog(true)}
                  className={restaurant.isVerified 
                    ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" 
                    : "bg-white/5 text-white/60 border-white/20 hover:bg-white/10"
                  }
                >
                  {restaurant.isVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" /> Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" /> Not Verified
                    </>
                  )}
                </Button>
              </div>
              {restaurant.bio ? (
                <p className="text-white/60 mt-1 line-clamp-2">{restaurant.bio}</p>
              ) : (
                <p className="text-white/30 mt-1 italic">No description provided</p>
              )}

              {/* Quick Info Row */}
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-white/50 text-sm flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {restaurant.phone || <span className="text-white/30 italic">No phone</span>}
                </span>
                <span className="text-amber-400 text-sm flex items-center gap-1">
                   {formatPriceRange(restaurant.priceRange) || <span className="text-white/30 italic">Price range not set</span>}
                </span>
                <Badge variant="outline" className={`text-xs ${restaurant.hasReservation ? 'text-green-400 border-green-400/30' : 'text-white/30 border-white/10'}`}>
                  {restaurant.hasReservation ? 'Reservations Available' : 'No Reservations'}
                </Badge>
                <Badge variant="outline" className={`text-xs ${restaurant.hasAlcohol ? 'text-red-400 border-red-400/30' : 'text-white/30 border-white/10'}`}>
                  {restaurant.hasAlcohol ? '🍺 Serves Alcohol' : 'No Alcohol'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Owner & Timestamps */}
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <User className="w-4 h-4" />
              <span>Owner ID: {restaurant.ownerId ? `${restaurant.ownerId.substring(0, 12)}...` : <span className="text-white/30 italic">Not set</span>}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatDate(restaurant.createdAt) || <span className="text-white/30 italic">Unknown</span>}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="glass w-full flex-wrap justify-start h-auto gap-1 p-2">
          {STEPS.map((step) => (
            <TabsTrigger key={step.id} value={step.title.toLowerCase().replace(' ', '-')} className="flex items-center gap-1 text-xs">
              <step.icon className="w-3 h-3" />
              {step.title}
            </TabsTrigger>
          ))}
          <TabsTrigger value="beverages" className="flex items-center gap-1 text-xs">
            🍹 Beverages
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1 text-xs">
            🎉 Events
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Basic Info */}
        <TabsContent value="basic-info" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            Basic Info
          </h3>
          <div className="space-y-4">
            <InfoRow label="Restaurant Name" value={restaurant.name} />
            <InfoRow label="Description / Bio" value={restaurant.bio} />
            <InfoRow label="Phone Number" value={restaurant.phone} />
            <InfoRow label="Contact Email" value={restaurant.contactemail} />
            <InfoRow label="Website URL" value={restaurant.websiteurl} isLink />
            <InfoRow label="Address" value={restaurant.address} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-white/50 text-sm min-w-[180px]">Location Coordinates:</span>
              {parsedLocation ? (
                <span className="text-white font-mono text-sm">
                  {parsedLocation.lat?.toFixed(6)}, {parsedLocation.lng?.toFixed(6)}
                </span>
              ) : (
                <span className="text-white/30 text-sm italic">Not set</span>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Step 2: Branding */}
        <TabsContent value="branding" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-500" />
            Branding
          </h3>
          <div className="space-y-6">
            {/* Logo Image */}
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2">Logo Image</h4>
              {restaurant.logoImage ? (
                <a
                  href={restaurant.logoImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-24 h-24 rounded-xl overflow-hidden border border-white/20 hover:border-amber-500/50 transition-colors"
                >
                  <img src={restaurant.logoImage} alt="Logo" className="w-full h-full object-cover" />
                </a>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/30 text-xs text-center">No logo<br/>uploaded</span>
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2">Cover Image</h4>
              {restaurant.coverImage ? (
                <a
                  href={restaurant.coverImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block h-32 rounded-xl overflow-hidden border border-white/20 hover:border-amber-500/50 transition-colors"
                >
                  <img src={restaurant.coverImage} alt="Cover" className="h-full object-cover" />
                </a>
              ) : (
                <div className="h-32 w-full max-w-md rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/30 text-sm">No cover image uploaded</span>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2">
                Gallery Images ({restaurant.gallery?.length || 0})
              </h4>
              {restaurant.gallery?.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {restaurant.gallery.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-colors"
                    >
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/20">
                  <Image className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-white/30 text-sm">No gallery images uploaded</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Step 3: Legal */}
        <TabsContent value="legal" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Legal Information
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* FSSAI */}
              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  FSSAI License
                </h4>
                <InfoRow label="License Number" value={legalInfo?.fssailicensenumber} />
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                  <span className="text-white/50 text-sm min-w-[180px]">Certificate(s):</span>
                  {legalInfo?.fssaicertificate ? (
                    Array.isArray(legalInfo.fssaicertificate) ? (
                      <div className="flex flex-wrap gap-2">
                        {legalInfo.fssaicertificate.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                             className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded">
                            Certificate #{idx + 1} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a href={legalInfo.fssaicertificate} target="_blank" rel="noopener noreferrer"
                         className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1">
                        View Certificate <ExternalLink className="w-3 h-3" />
                      </a>
                    )
                  ) : (
                    <span className="text-white/30 text-sm italic">Not uploaded</span>
                  )}
                </div>
              </div>

              {/* GST */}
              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  GST Registration
                </h4>
                <InfoRow label="GST Number" value={legalInfo?.gstnumber} />
                <InfoRow label="GST Certificate" value={legalInfo?.gstcertificate} isDocument />
              </div>

              {/* PAN */}
              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  PAN Details
                </h4>
                <InfoRow label="PAN Number" value={legalInfo?.pannumber} />
                <InfoRow label="PAN Card Image" value={legalInfo?.panimage} isDocument />
              </div>

              {/* BBMP Trade License */}
              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  BBMP Trade License
                </h4>
                <InfoRow label="Trade License Document" value={legalInfo?.bbmptradelicense} isDocument />
              </div>

              {/* Liquor License */}
              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Wine className="w-4 h-4 text-amber-400" />
                  Liquor License
                  {restaurant.hasAlcohol && !legalInfo?.liquorlicense && (
                    <Badge variant="outline" className="text-xs text-red-400 border-red-400/30 ml-2">
                      ⚠️ Required (Serves Alcohol)
                    </Badge>
                  )}
                </h4>
                <InfoRow 
                  label="Serves Alcohol" 
                  value={restaurant.hasAlcohol ? "Yes" : "No"} 
                  highlight={restaurant.hasAlcohol}
                />
                <InfoRow label="Liquor License Document" value={legalInfo?.liquorlicense} isDocument />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Step 4: Operational */}
        <TabsContent value="operational" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Operational Details
          </h3>
          <div className="space-y-6">
            {/* Price Range */}
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-white/80 text-sm font-medium mb-2">Price Range</h4>
              <span className="text-amber-400 text-2xl font-bold">
                {formatPriceRange(restaurant.priceRange) || <span className="text-white/30 text-lg italic font-normal">Not set</span>}
              </span>
            </div>

            {/* Cuisine Tags */}
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-white/80 text-sm font-medium mb-2">Cuisine Types</h4>
              {restaurant.cuisineTags?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisineTags.map(tag => (
                    <Badge key={tag} className="bg-amber-500/20 text-amber-400 border-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 italic text-sm">No cuisines specified</p>
              )}
            </div>

            {/* Amenities */}
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-white/80 text-sm font-medium mb-2">Amenities</h4>
              {restaurant.amenities?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {restaurant.amenities.map(amenity => (
                    <Badge key={amenity} variant="outline" className="border-white/20 text-white/60">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 italic text-sm">No amenities specified</p>
              )}
            </div>

            {/* Reservations */}
            <div className="p-4 bg-white/5 rounded-xl space-y-2">
              <h4 className="text-white/80 text-sm font-medium">Reservations</h4>
              <InfoRow label="Accepts Reservations" value={restaurant.hasReservation ? "Yes" : "No"} highlight={restaurant.hasReservation} />
              <InfoRow label="Reservation Link" value={restaurant.reservationLink} isLink />
            </div>

            {/* Opening Hours */}
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Opening Hours
              </h4>
              {(() => {
                const hours = parseOpeningHours(restaurant.openingHours)
                if (hours && Array.isArray(hours)) {
                  return (
                    <div className="grid grid-cols-1 gap-1">
                      {hours.map((dayInfo) => (
                        <div key={dayInfo.day} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-white/5">
                          <span className="text-white/70 w-28">{dayInfo.day}</span>
                          {dayInfo.isClosed ? (
                            <span className="text-red-400">Closed</span>
                          ) : (
                            <span className="text-white/60">
                              {formatTime(dayInfo.openTime || dayInfo.open)} - {formatTime(dayInfo.closeTime || dayInfo.close)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                } else {
                  return <p className="text-white/30 italic text-sm">Opening hours not specified</p>
                }
              })()}
            </div>
          </div>
        </TabsContent>

        {/* Step 5: Menu */}
        <TabsContent value="menu" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-500" />
            Food Menu ({restaurant.foodMenuPics?.length || 0} documents)
          </h3>
          {restaurant.foodMenuPics?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {restaurant.foodMenuPics.map((url, idx) => {
                const isPdf = url.toLowerCase().endsWith('.pdf')
                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${isPdf ? 'p-4 flex flex-col items-center justify-center' : 'aspect-square'} rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/50 transition-colors bg-white/5`}
                  >
                    {isPdf ? (
                      <>
                        <FileText className="w-10 h-10 text-red-400 mb-2" />
                        <span className="text-white/60 text-sm">Menu PDF #{idx + 1}</span>
                        <ExternalLink className="w-3 h-3 text-white/40 mt-1" />
                      </>
                    ) : (
                      <img src={url} alt={`Menu ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                  </a>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/20">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No menu documents uploaded</p>
              <p className="text-white/30 text-xs mt-1">Restaurant owner has not added any food menu images yet</p>
            </div>
          )}
        </TabsContent>

        {/* Step 6: Social */}
        <TabsContent value="social" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-amber-500" />
            Social & External Links
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl space-y-3">
              <InfoRow 
                label="📸 Instagram" 
                value={restaurant.instaLink} 
                isLink 
                linkColor="text-pink-400"
              />
              <InfoRow 
                label="📘 Facebook" 
                value={restaurant.facebookLink} 
                isLink 
                linkColor="text-blue-400"
              />
              <InfoRow 
                label="🐦 Twitter" 
                value={restaurant.twitterLink} 
                isLink 
                linkColor="text-sky-400"
              />
              <InfoRow 
                label="📍 Google Maps" 
                value={restaurant.googleMapsLink} 
                isLink 
                linkColor="text-green-400"
              />
              <InfoRow 
                label="🌐 Website" 
                value={restaurant.websiteurl} 
                isLink 
                linkColor="text-blue-400"
              />
              <InfoRow 
                label="🔗 Reservation Link" 
                value={restaurant.reservationLink} 
                isLink 
                linkColor="text-purple-400"
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 7: Financial */}
        <TabsContent value="financial" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500" />
            Bank & Financial Details
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Bank Account Details
                </h4>
                <InfoRow label="Account Number" value={bankDetails?.accountnumber} mask />
                <InfoRow label="IFSC Code" value={bankDetails?.ifsccode} />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Beverages Tab */}
        <TabsContent value="beverages" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            🍹 Beverages
          </h3>
          <BeverageList restaurantId={restaurant.id} />
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            🎉 Events
          </h3>
          <EventList restaurantId={restaurant.id} />
        </TabsContent>
      </Tabs>

      {/* Verification Confirmation Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="glass-strong border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {restaurant.isVerified ? (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  Remove Verification
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Verify Restaurant
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-white/60 mt-2">
              {restaurant.isVerified ? (
                <>
                  Are you sure you want to <strong className="text-red-400">remove verification</strong> from <strong className="text-white">{restaurant.name}</strong>?
                  <br /><br />
                  This will mark the restaurant as unverified and it may affect its visibility.
                </>
              ) : (
                <>
                  Are you sure you want to <strong className="text-green-400">verify</strong> <strong className="text-white">{restaurant.name}</strong>?
                  <br /><br />
                  {restaurant.iscomplete === false && (
                    <span className="text-amber-400 block mb-2">
                      ⚠️ Warning: This restaurant has not completed all required fields!
                    </span>
                  )}
                  Please ensure you have reviewed all the restaurant details, legal info, and bank details before verifying.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              disabled={verifying}
              className="glass border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerificationChange}
              disabled={verifying}
              className={restaurant.isVerified 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-green-500 hover:bg-green-600 text-white"
              }
            >
              {verifying ? (
                "Updating..."
              ) : restaurant.isVerified ? (
                "Yes, Remove Verification"
              ) : (
                "Yes, Verify Restaurant"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for displaying info rows - always shows fields, even when empty
function InfoRow({ label, value, mask, isLink, isDocument, linkColor, highlight }) {
  // Mask sensitive info (show first 4 and last 4 chars)
  const displayValue = mask && value && value.length > 8 
    ? `${value.slice(0, 4)}${'*'.repeat(value.length - 8)}${value.slice(-4)}`
    : value

  const isEmpty = !value || (typeof value === 'string' && value.trim() === '')

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-white/50 text-sm min-w-[180px]">{label}:</span>
      {isEmpty ? (
        <span className="text-white/30 text-sm italic">Not provided</span>
      ) : isLink ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`${linkColor || 'text-amber-500'} hover:opacity-80 text-sm flex items-center gap-1`}
        >
          {value.length > 40 ? `${value.substring(0, 40)}...` : value}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : isDocument ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1"
        >
          View Document <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className={`${highlight ? 'text-green-400' : 'text-white'} font-mono text-sm`}>{displayValue}</span>
      )}
    </div>
  )
}
