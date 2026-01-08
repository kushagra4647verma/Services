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
  Store, MapPin, Phone, Clock, DollarSign, Image, ExternalLink,
  FileText, Building, CreditCard, User, Calendar, Shield, CheckCircle, XCircle
} from "lucide-react"

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

// Parse and format opening hours JSON
function formatOpeningHours(hoursData) {
  if (!hoursData) return null
  try {
    const hours = typeof hoursData === 'string' ? JSON.parse(hoursData) : hoursData
    if (!Array.isArray(hours)) return hoursData
    
    return hours.map(day => {
      if (day.isClosed) return `${day.day}: Closed`
      return `${day.day}: ${day.open} - ${day.close}`
    }).join('\n')
  } catch {
    return hoursData
  }
}

export default function RestaurantDetail({ restaurant, onRestaurantUpdated }) {
  const [legalInfo, setLegalInfo] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verifying, setVerifying] = useState(false)

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
                <h2 className="text-white text-2xl font-bold truncate">{restaurant.name}</h2>
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
                  <DollarSign className="w-3 h-3" /> {formatPriceRange(restaurant.priceRange) || <span className="text-white/30 italic">Not set</span>}
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
              <span>Owner ID: {restaurant.ownerId?.substring(0, 12)}...</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatDate(restaurant.createdAt)}</span>
            </div>
          </div>

          {/* Tags Section */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="mb-3">
              <span className="text-white/50 text-xs uppercase tracking-wider">Cuisines</span>
              {restaurant.cuisineTags?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {restaurant.cuisineTags.map(tag => (
                    <Badge key={tag} className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm italic mt-1">No cuisines specified</p>
              )}
            </div>
            <div>
              <span className="text-white/50 text-xs uppercase tracking-wider">Amenities</span>
              {restaurant.amenities?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {restaurant.amenities.map(amenity => (
                    <Badge key={amenity} variant="outline" className="border-white/20 text-white/60 text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm italic mt-1">No amenities specified</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <span className="text-white/50 text-xs uppercase tracking-wider block mb-2">Social & Links</span>
            <div className="flex flex-wrap gap-3">
              {restaurant.instaLink ? (
                <a href={restaurant.instaLink} target="_blank" rel="noopener noreferrer"
                   className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1">
                  📸 Instagram <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-white/30 text-sm">📸 Instagram: <em>Not provided</em></span>
              )}
              {restaurant.facebookLink ? (
                <a href={restaurant.facebookLink} target="_blank" rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  📘 Facebook <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-white/30 text-sm">📘 Facebook: <em>Not provided</em></span>
              )}
              {restaurant.twitterLink ? (
                <a href={restaurant.twitterLink} target="_blank" rel="noopener noreferrer"
                   className="text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1">
                  🐦 Twitter <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-white/30 text-sm">🐦 Twitter: <em>Not provided</em></span>
              )}
              {restaurant.googleMapsLink ? (
                <a href={restaurant.googleMapsLink} target="_blank" rel="noopener noreferrer"
                   className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1">
                  📍 Maps <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-white/30 text-sm">📍 Maps: <em>Not provided</em></span>
              )}
              {restaurant.hasReservation && restaurant.reservationLink ? (
                <a href={restaurant.reservationLink} target="_blank" rel="noopener noreferrer"
                   className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                  🔗 Reservations <ExternalLink className="w-3 h-3" />
                </a>
              ) : restaurant.hasReservation ? (
                <span className="text-white/30 text-sm">🔗 Reservations: <em>Link not provided</em></span>
              ) : null}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
              {restaurant.openingHours ? (
                <p className="text-white/60 text-sm whitespace-pre-line">{formatOpeningHours(restaurant.openingHours)}</p>
              ) : (
                <p className="text-white/30 text-sm italic">Opening hours not specified</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mt-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
              {restaurant.address ? (
                <p className="text-white/60 text-sm">{restaurant.address}</p>
              ) : (
                <p className="text-white/30 text-sm italic">Address not provided</p>
              )}
            </div>
          </div>

          {/* Location Coordinates */}
          <div className="mt-2 text-white/40 text-xs">
            Coordinates: {restaurant.location ? (
              <>{restaurant.location.lat?.toFixed(6)}, {restaurant.location.lng?.toFixed(6)}</>
            ) : (
              <span className="text-white/30 italic">Not set</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="glass w-full justify-start">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="beverages">Beverages</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="bank">Bank</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-amber-500" />
            Gallery ({restaurant.gallery?.length || 0} images)
          </h3>
          {restaurant.gallery?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
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
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No gallery images uploaded</p>
              <p className="text-white/30 text-xs mt-1">Restaurant owner has not added any gallery images yet</p>
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

        {/* Documents Tab */}
        <TabsContent value="documents" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Food Menu ({restaurant.foodMenuPics?.length || 0} documents)
          </h3>
          {restaurant.foodMenuPics?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {restaurant.foodMenuPics.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-lg p-3 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-white/80 text-sm truncate">Menu Page {idx + 1}</span>
                  <ExternalLink className="w-3 h-3 text-white/40 ml-auto" />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No menu documents uploaded</p>
              <p className="text-white/30 text-xs mt-1">Restaurant owner has not added any food menu images yet</p>
            </div>
          )}
        </TabsContent>

        {/* Legal Info Tab */}
        <TabsContent value="legal" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-500" />
            Legal Information
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow label="FSSAI License Number" value={legalInfo?.fssailicensenumber} />
              <InfoRow label="FSSAI Certificate" value={legalInfo?.fssaicertificate} isLink />
              <InfoRow label="GST Number" value={legalInfo?.gstnumber} />
              <InfoRow label="GST Certificate" value={legalInfo?.gstcertificate} isLink />
              <InfoRow label="PAN Number" value={legalInfo?.pannumber} />
              <InfoRow label="PAN Image" value={legalInfo?.panimage} isLink />
              <InfoRow label="BBMP Trade License" value={legalInfo?.bbmptradelicense} isLink />
              <InfoRow label="Liquor License" value={legalInfo?.liquorlicense} isLink showAlcoholWarning={restaurant.hasAlcohol && !legalInfo?.liquorlicense} />
            </div>
          )}
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank" className="glass rounded-2xl p-5 mt-4">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Bank Details
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow label="Account Number" value={bankDetails?.accountnumber} mask />
              <InfoRow label="IFSC Code" value={bankDetails?.ifsccode} />
            </div>
          )}
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
function InfoRow({ label, value, mask, isLink, showAlcoholWarning }) {
  // Mask sensitive info (show first 4 and last 4 chars)
  const displayValue = mask && value && value.length > 8 
    ? `${value.slice(0, 4)}${'*'.repeat(value.length - 8)}${value.slice(-4)}`
    : value

  const isEmpty = !value || (typeof value === 'string' && value.trim() === '')

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="text-white/50 text-sm min-w-[180px]">{label}:</span>
      {isEmpty ? (
        <span className="text-white/30 text-sm italic flex items-center gap-2">
          Not provided
          {showAlcoholWarning && (
            <Badge variant="outline" className="text-xs text-red-400 border-red-400/30">
              ⚠️ Required for alcohol
            </Badge>
          )}
        </span>
      ) : isLink ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1"
        >
          View Document <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-white font-mono text-sm">{displayValue}</span>
      )}
    </div>
  )
}
