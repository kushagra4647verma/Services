import { Store, MapPin, Trash2, Star, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RestaurantList({
  restaurants,
  onSelect,
  onDelete
}) {
  // Get first image from foodMenuPics or use a placeholder
  const getRestaurantImage = (restaurant) => {
    if (restaurant.foodMenuPics && restaurant.foodMenuPics.length > 0) {
      return restaurant.foodMenuPics[0]
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {restaurants.map(r => {
        const image = getRestaurantImage(r)
        
        return (
          <div
            key={r.id}
            className="glass rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200"
            onClick={() => onSelect(r)}
          >
            {/* Image Section */}
            <div className="relative h-48">
              {image ? (
                <img 
                  src={image} 
                  alt={r.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                  <Store className="w-16 h-16 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Delete button */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {/* Verified Badge */}
                {r.isVerified ? (
                  <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded-full bg-white/10 border border-white/20 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-white/60" />
                    <span className="text-white/60 text-xs font-medium">Pending</span>
                  </div>
                )}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onDelete(r.id)
                  }}
                  className="w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition-transform hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4 text-white hover:text-red-500" />
                </button>
              </div>

              {/* Restaurant info overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-semibold text-lg mb-1">{r.name}</h3>
                {r.location && (
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <MapPin className="w-3 h-3" />
                    <span>Location set</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-3">
              {/* Rating & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-amber-500 font-semibold text-sm">New</span>
                  </div>
                </div>
                {r.foodMenuPics && r.foodMenuPics.length > 0 && (
                  <span className="text-white/60 text-xs">{r.foodMenuPics.length} doc(s)</span>
                )}
              </div>
              
              {/* Bio */}
              {r.bio && (
                <p className="text-white/60 text-sm line-clamp-2">{r.bio}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                <span className="text-xs px-2 py-1 glass rounded-full text-white/80">Restaurant</span>
                {r.location && (
                  <span className="text-xs px-2 py-1 glass rounded-full text-amber-500/80">📍 Located</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
