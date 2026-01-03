import { useState } from "react"
import { createBeverage } from "../../api/beverages"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Wine, X } from "lucide-react"

export default function BeverageForm({ restaurantId, onCreate, onCancel }) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!name.trim()) return
    
    setLoading(true)
    try {
      const beverage = await createBeverage(restaurantId, { name })
      onCreate(beverage)
      setName("")
    } catch (err) {
      console.error(err)
      alert("Failed to add beverage")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-white/80 mb-2 block flex items-center gap-2">
          <Wine className="w-4 h-4 text-amber-500" />
          Beverage Name *
        </label>
        <Input
          placeholder="Enter beverage name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="glass border-white/20 text-white placeholder:text-white/40 h-12"
        />
      </div>

      <div className="flex gap-3">
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
          disabled={loading || !name.trim()}
          className={`${onCancel ? 'flex-1' : 'w-full'} gradient-amber text-black font-semibold h-11 rounded-xl hover:opacity-90`}
        >
          {loading ? "Adding..." : "Add Beverage"}
        </Button>
      </div>
    </div>
  )
}
