import { useState, useEffect } from "react"
import BeverageList from "../beverages/BeverageList"
import EventList from "../events/EventList"
import RestaurantForm from "./RestaurantForm"
import { getLegalInfo, getBankDetails, getRestaurant } from "../../api/restaurants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Store, FileText, Edit2, MapPin, Phone,
  Clock, IndianRupee, Image, ExternalLink, Wine, Shield, Mail, Globe, AlertTriangle
} from "lucide-react"

// Convert database integer to display string
function formatPriceRange(value) {
  const map = { 1: "₹", 2: "₹₹", 3: "₹₹₹", 4: "₹₹₹₹" }
  return map[value] || value
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

// Format time from 24h to 12h format
function formatTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

// Check if closing time is before or equal to opening time (next day)
function isNextDayClosing(openTime, closeTime) {
  if (!openTime || !closeTime) return false
  return closeTime <= openTime
}

export default function RestaurantDetail({
  restaurant,
  onRestaurantUpdated
}) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [legalInfo, setLegalInfo] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [loadingExtra, setLoadingExtra] = useState(false)

  // Load legal info on mount
  useEffect(() => {
    if (restaurant?.id) {
      loadLegalInfo()
    }
  }, [restaurant?.id])

  // Load legal and bank info when opening edit modal
  useEffect(() => {
    if (showEditModal && restaurant?.id) {
      loadExtraInfo()
    }
  }, [showEditModal, restaurant?.id])

  async function loadLegalInfo() {
    try {
      const legal = await getLegalInfo(restaurant.id).catch(() => null)
      setLegalInfo(legal)
    } catch (err) {
      console.error("Failed to load legal info:", err)
    }
  }

  async function loadExtraInfo() {
    setLoadingExtra(true)
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
      setLoadingExtra(false)
    }
  }

  function handleEditComplete(updatedRestaurant) {
    onRestaurantUpdated(updatedRestaurant)
  }

  async function handleEditModalClose() {
    setShowEditModal(false)
    // Refresh restaurant and legal info after edit
    try {
      const [freshRestaurant, freshLegal] = await Promise.all([
        getRestaurant(restaurant.id).catch(() => null),
        getLegalInfo(restaurant.id).catch(() => null)
      ])
      if (freshRestaurant) {
        onRestaurantUpdated(freshRestaurant)
      }
      if (freshLegal) {
        setLegalInfo(freshLegal)
      }
    } catch (err) {
      console.error("Failed to refresh data:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Incomplete Warning Banner */}
      {restaurant.iscomplete === false && (
        <div className="glass rounded-xl p-4 border border-amber-500/40 bg-amber-500/10 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-amber-400 font-medium">Form Incomplete</p>
            <p className="text-amber-400/80 text-sm">Please complete all required fields to get your restaurant verified.</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowEditModal(true)}
            className="gradient-amber text-black font-medium"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Complete Now
          </Button>
        </div>
      )}

      {/* Restaurant Header with Cover */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        {/* Cover Image */}
        {restaurant.coverImage && (
          <div className="h-40 w-full relative">
            <img
              src={restaurant.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

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
              <div className="w-16 h-16 rounded-xl gradient-amber flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-black" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-white text-2xl font-bold truncate">{restaurant.name}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-amber-400 hover:bg-amber-500/20 flex-shrink-0"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              {restaurant.bio && (
                <p className="text-white/60 mt-1 line-clamp-2">{restaurant.bio}</p>
              )}

              {/* Quick Info Row */}
              <div className="flex flex-wrap gap-3 mt-3">
                {restaurant.phone && (
                  <span className="text-white/50 text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {restaurant.phone}
                  </span>
                )}
                {restaurant.contactemail && (
                  <a href={`mailto:${restaurant.contactemail}`} className="text-white/50 text-sm flex items-center gap-1 hover:text-white/70">
                    <Mail className="w-3 h-3" /> {restaurant.contactemail}
                  </a>
                )}
                {restaurant.websiteurl && (
                  <a href={restaurant.websiteurl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300">
                    <Globe className="w-3 h-3" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {restaurant.priceRange && (
                  <span className="text-amber-400 text-sm font-medium">
                    {formatPriceRange(restaurant.priceRange)}
                  </span>
                )}
                {restaurant.hasReservation && (
                  <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                    Reservations
                  </Badge>
                )}
                {restaurant.hasAlcohol && (
                  <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-xs flex items-center gap-1">
                    <Wine className="w-3 h-3" /> Serves Alcohol
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          {(restaurant.cuisineTags?.length > 0 || restaurant.amenities?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              {restaurant.cuisineTags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {restaurant.cuisineTags.map(tag => (
                    <Badge key={tag} className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {restaurant.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {restaurant.amenities.map(amenity => (
                    <Badge key={amenity} variant="outline" className="border-white/20 text-white/60 text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {(restaurant.instaLink || restaurant.facebookLink || restaurant.twitterLink || restaurant.googleMapsLink) && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {restaurant.instaLink && (
                <a href={restaurant.instaLink} target="_blank" rel="noopener noreferrer"
                   className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1">
                  📸 Instagram <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {restaurant.facebookLink && (
                <a href={restaurant.facebookLink} target="_blank" rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  📘 Facebook <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {restaurant.twitterLink && (
                <a href={restaurant.twitterLink} target="_blank" rel="noopener noreferrer"
                   className="text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1">
                  🐦 Twitter <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {restaurant.googleMapsLink && (
                <a href={restaurant.googleMapsLink} target="_blank" rel="noopener noreferrer"
                   className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1">
                  📍 Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Opening Hours */}
          {restaurant.openingHours && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-white/80 text-sm font-medium">Opening Hours</span>
              </div>
              {(() => {
                const hours = parseOpeningHours(restaurant.openingHours)
                if (hours && Array.isArray(hours)) {
                  return (
                    <div className="grid grid-cols-1 gap-1">
                      {hours.map((dayInfo) => {
                        const showNextDay = !dayInfo.isClosed && isNextDayClosing(dayInfo.openTime, dayInfo.closeTime)
                        return (
                          <div key={dayInfo.day} className="flex items-center justify-between text-sm py-1">
                            <span className="text-white/70 w-24">{dayInfo.day.slice(0, 3)}</span>
                            {dayInfo.isClosed ? (
                              <span className="text-red-400">Closed</span>
                            ) : (
                              <span className="text-white/60 flex items-center gap-1">
                                {formatTime(dayInfo.openTime)} - {formatTime(dayInfo.closeTime)}
                                {showNextDay && (
                                  <span className="text-amber-400 text-xs font-semibold bg-amber-500/20 px-1 py-0.5 rounded" title="Closes next day">
                                    +1
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                } else {
                  return <p className="text-white/60 text-sm whitespace-pre-line">{restaurant.openingHours}</p>
                }
              })()}
            </div>
          )}

          {/* Address */}
          {restaurant.address && (
            <div className="mt-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
                <p className="text-white/60 text-sm">{restaurant.address}</p>
              </div>
            </div>
          )}

          {/* Liquor License (shown when hasAlcohol is true) */}
          {restaurant.hasAlcohol && legalInfo?.liquorlicense && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-amber-500" />
                <span className="text-white/80 text-sm font-medium">Liquor License</span>
                <a
                  href={legalInfo.liquorlicense}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Beverages Section */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          🍹 Beverages
        </h3>
        <BeverageList restaurantId={restaurant.id} />
      </div>

      {/* Events Section */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          🎉 Events
        </h3>
        <EventList restaurantId={restaurant.id} />
      </div>

      {/* Documents Section */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          All Documents & Media
        </h3>

        <div className="space-y-6">
          {/* Logo Image */}
          {restaurant.logoImage && (
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Logo Image
              </h4>
              <a
                href={restaurant.logoImage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-20 h-20 rounded-xl overflow-hidden border border-white/20 hover:border-amber-500/50 transition-colors"
              >
                <img src={restaurant.logoImage} alt="Logo" className="w-full h-full object-cover" />
              </a>
            </div>
          )}

          {/* Cover Image */}
          {restaurant.coverImage && (
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Cover Image
              </h4>
              <a
                href={restaurant.coverImage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block h-32 rounded-xl overflow-hidden border border-white/20 hover:border-amber-500/50 transition-colors"
              >
                <img src={restaurant.coverImage} alt="Cover" className="h-full object-cover" />
              </a>
            </div>
          )}

          {/* Gallery Images */}
          {restaurant.gallery?.length > 0 && (
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <Image className="w-4 h-4 text-amber-500" />
                Gallery Images ({restaurant.gallery.length})
              </h4>
              <div className="grid grid-cols-4 gap-2">
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
            </div>
          )}

          {/* Food Menu */}
          {restaurant.foodMenuPics?.length > 0 && (
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Food Menu ({restaurant.foodMenuPics.length})
              </h4>
              <div className="grid grid-cols-3 gap-2">
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
                          <FileText className="w-8 h-8 text-red-400 mb-1" />
                          <span className="text-white/60 text-xs">PDF</span>
                        </>
                      ) : (
                        <img src={url} alt={`Menu ${idx + 1}`} className="w-full h-full object-cover" />
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Legal Documents */}
          {legalInfo && (
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Legal Documents
              </h4>
              <div className="space-y-2">
                {/* FSSAI Certificate */}
                {legalInfo.fssaicertificate && (
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm flex-1">FSSAI Certificate</span>
                    {Array.isArray(legalInfo.fssaicertificate) ? (
                      <div className="flex gap-1">
                        {legalInfo.fssaicertificate.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                             className="text-amber-400 hover:text-amber-300 text-xs px-2 py-1 bg-amber-500/10 rounded">
                            #{idx + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a href={legalInfo.fssaicertificate} target="_blank" rel="noopener noreferrer"
                         className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* GST Certificate */}
                {legalInfo.gstcertificate && (
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm flex-1">GST Certificate</span>
                    <a href={legalInfo.gstcertificate} target="_blank" rel="noopener noreferrer"
                       className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* PAN Card */}
                {legalInfo.panimage && (
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm flex-1">PAN Card</span>
                    <a href={legalInfo.panimage} target="_blank" rel="noopener noreferrer"
                       className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* BBMP Trade License */}
                {legalInfo.bbmptradelicense && (
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm flex-1">BBMP Trade License</span>
                    <a href={legalInfo.bbmptradelicense} target="_blank" rel="noopener noreferrer"
                       className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Liquor License */}
                {legalInfo.liquorlicense && (
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <Wine className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm flex-1">Liquor License</span>
                    <a href={legalInfo.liquorlicense} target="_blank" rel="noopener noreferrer"
                       className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show message if no documents at all */}
          {!restaurant.logoImage && !restaurant.coverImage && !restaurant.gallery?.length && 
           !restaurant.foodMenuPics?.length && !legalInfo && (
            <p className="text-white/40 text-center py-4">No documents uploaded yet</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        if (!open) {
          handleEditModalClose()
        } else {
          setShowEditModal(true)
        }
      }}>
        <DialogContent className="glass-strong border-white/20 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-500" />
              Edit Restaurant
            </DialogTitle>
          </DialogHeader>

          {loadingExtra ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <RestaurantForm
                editRestaurant={restaurant}
                editLegalInfo={legalInfo}
                editBankDetails={bankDetails}
                onRestaurantUpdated={handleEditComplete}
                onComplete={handleEditModalClose}
                onCancel={handleEditModalClose}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
