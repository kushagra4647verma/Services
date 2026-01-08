import { useEffect, useState } from "react"
import { getBeverages } from "../../api/beverages"
import { Badge } from "@/components/ui/badge"
import { Wine, DollarSign, Star, Tag, Droplets, Beaker, AlertTriangle, Sparkles, FileText, Utensils } from "lucide-react"

export default function BeverageList({ restaurantId }) {
  const [beverages, setBeverages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBeverage, setSelectedBeverage] = useState(null)

  useEffect(() => {
    if (!restaurantId) return

    async function load() {
      setLoading(true)
      try {
        const data = await getBeverages(restaurantId)
        setBeverages(data || [])
      } catch (err) {
        console.error("Failed to load beverages:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [restaurantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (beverages.length === 0) {
    return (
      <div className="text-center py-8">
        <Wine className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No beverages added yet</p>
      </div>
    )
  }

  // If a beverage is selected, show detail view
  if (selectedBeverage) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedBeverage(null)}
          className="text-amber-500 text-sm hover:underline flex items-center gap-1"
        >
          ← Back to list
        </button>
        <BeverageDetailView beverage={selectedBeverage} />
      </div>
    )
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {beverages.map(beverage => (
        <div
          key={beverage.id}
          onClick={() => setSelectedBeverage(beverage)}
          className="glass rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Photo or Icon */}
            {beverage.photo ? (
              <img
                src={beverage.photo}
                alt={beverage.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Wine className="w-6 h-6 text-amber-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-medium truncate">{beverage.name}</h4>
                {beverage.isSignatureItem && (
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                  {beverage.category || <span className="text-white/30 italic">No category</span>}
                </Badge>
                <Badge variant="outline" className={`text-xs border-white/20 ${beverage.drinkType === 'Alcoholic' ? 'text-red-400' : beverage.drinkType === 'Non-Alcoholic' ? 'text-green-400' : 'text-white/30'}`}>
                  {beverage.drinkType || <span className="italic">No type</span>}
                </Badge>
              </div>

              <div className="text-amber-500 text-sm mt-2 flex items-center gap-1">
                
                {beverage.price ? `₹${beverage.price}` : <span className="text-white/30 italic">No price</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Beverage detail view component
function BeverageDetailView({ beverage }) {
  return (
    <div className="glass-strong rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {beverage.photo ? (
          <img
            src={beverage.photo}
            alt={beverage.name}
            className="w-24 h-24 rounded-xl object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Wine className="w-10 h-10 text-amber-500" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-xl font-bold">{beverage.name}</h3>
            {beverage.isSignatureItem && (
              <Badge className="bg-amber-500/20 text-amber-400 border-0">
                <Star className="w-3 h-3 mr-1 fill-amber-400" />
                Signature
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="border-white/20 text-white/60">
              <Tag className="w-3 h-3 mr-1" />
              {beverage.category || <span className="text-white/30 italic">No category</span>}
            </Badge>
            <Badge variant="outline" className={`border-white/20 ${beverage.drinkType === 'Alcoholic' ? 'text-red-400' : beverage.drinkType === 'Non-Alcoholic' ? 'text-green-400' : 'text-white/30'}`}>
              {beverage.drinkType || <span className="italic">No drink type</span>}
            </Badge>
            <Badge variant="outline" className="border-white/20 text-white/60">
              {beverage.baseType || <span className="text-white/30 italic">No style</span>}
            </Badge>
          </div>
        </div>
      </div>

      {/* Price & Size */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          
          {beverage.price ? (
            <span className="text-white text-lg font-semibold">₹{beverage.price}</span>
          ) : (
            <span className="text-white/30 italic">Price not set</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Droplets className="w-4 h-4" />
          {beverage.sizeVol ? (
            <span>{beverage.sizeVol} ml</span>
          ) : (
            <span className="text-white/30 italic">Size not set</span>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="text-white/50 text-sm mb-1 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description
        </h4>
        {beverage.description ? (
          <p className="text-white/80">{beverage.description}</p>
        ) : (
          <p className="text-white/30 italic">No description provided</p>
        )}
      </div>

      {/* Ingredients */}
      <div>
        <h4 className="text-white/50 text-sm mb-2 flex items-center gap-2">
          <Beaker className="w-4 h-4" />
          Ingredients
        </h4>
        {beverage.ingredients?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {beverage.ingredients.map((ing, idx) => (
              <Badge key={idx} variant="outline" className="border-white/20 text-white/80">
                {ing}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-white/30 italic">No ingredients listed</p>
        )}
      </div>

      {/* Allergens */}
      <div>
        <h4 className="text-red-400 text-sm mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Allergens
        </h4>
        {beverage.allergens?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {beverage.allergens.map((allergen, idx) => (
              <Badge key={idx} variant="outline" className="border-red-400/30 text-red-400">
                {allergen}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-white/30 italic">No allergens specified</p>
        )}
      </div>

      {/* Flavor Tags */}
      <div>
        <h4 className="text-white/50 text-sm mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Flavor Profile
        </h4>
        {beverage.flavorTags?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {beverage.flavorTags.map((flavor, idx) => (
              <Badge key={idx} className="bg-purple-500/20 text-purple-400 border-0">
                {flavor}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-white/30 italic">No flavor tags added</p>
        )}
      </div>

      {/* Perfect Pairing */}
      <div>
        <h4 className="text-white/50 text-sm mb-2 flex items-center gap-2">
          <Utensils className="w-4 h-4" />
          Perfect Pairing
        </h4>
        {beverage.perfectPairing?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {beverage.perfectPairing.map((pairing, idx) => (
              <Badge key={idx} className="bg-green-500/20 text-green-400 border-0">
                {pairing}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-white/30 italic">No food pairings specified</p>
        )}
      </div>
    </div>
  )
}
