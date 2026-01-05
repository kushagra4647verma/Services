import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import Login from "./components/auth/Login"
import RestaurantList from "./components/restaurants/RestaurantList"
import RestaurantForm from "./components/restaurants/RestaurantForm"
import RestaurantDetail from "./components/restaurants/RestaurantDetail"
import {
  getMyRestaurants,
  createRestaurant,
  deleteRestaurant
} from "./api/restaurants"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GlassWater, Plus, Store, LogOut, MapPin } from "lucide-react"

export default function App() {
  const [session, setSession] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  async function bootstrap() {
    setLoading(true)
    const data = await getMyRestaurants()
    setRestaurants(data)
    setLoading(false)
  }

  useEffect(() => {
  document.documentElement.classList.add("dark")

  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      setSession(true)
      bootstrap()
    } else {
      setSession(false)
      setLoading(false)
    }
  })
}, [])


  async function handleLogin() {
    setSession(true)
    await bootstrap()
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(false)
    setRestaurants([])
    setSelected(null)
  }

  // 🔥 DELETE HANDLER
  async function handleDeleteRestaurant(restaurantId) {
    const ok = window.confirm(
      "Are you sure? This will permanently delete the restaurant and its uploaded files."
    )

    if (!ok) return

    try {
      await deleteRestaurant(restaurantId)

      setRestaurants(prev =>                    //not calling to getRestaurants to decrease API calls
        prev.filter(r => r.id !== restaurantId)
      )

      if (selected?.id === restaurantId) {
        setSelected(null)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to delete restaurant")
    }
  }

  if (!session) {
    return <Login onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/60 text-lg animate-pulse">Loading restaurants...</div>
      </div>
    )
  }

  // If a restaurant is selected, show the detail view
  if (selected) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-8">
        {/* Header */}
        <div className="glass-strong border-b border-white/10 p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setSelected(null)}
              className="text-white/80 hover:text-white"
            >
              ← Back
            </Button>
            <div className="flex items-center gap-2">
              <GlassWater className="w-6 h-6 text-amber-500" />
              <span className="text-xl font-bold">
                <span className="text-gradient-amber">Sip</span>
                <span className="text-gradient-purple">Zy</span>
              </span>
            </div>
            <div className="w-16" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          <RestaurantDetail
            restaurant={selected}
            onRestaurantUpdated={updated => {
              setRestaurants(prev =>
                prev.map(r =>
                  r.id === updated.id ? updated : r
                )
              )
              setSelected(updated)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      {/* Header */}
      <div className="glass-strong border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <GlassWater className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold">
              <span className="text-gradient-amber">Sip</span>
              <span className="text-gradient-purple">Zy</span>
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-white text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-white/60">Manage your restaurant listings</p>
        </div>

        {/* Create Restaurant Button */}
        <Button
          onClick={() => setShowCreateForm(true)}
          className="w-full gradient-amber text-black font-semibold h-14 rounded-xl mb-6 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Restaurant
        </Button>

        {/* Restaurant List Section */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            Your Restaurants
          </h3>

          {restaurants.length > 0 ? (
            <RestaurantList
              restaurants={restaurants}
              onSelect={setSelected}
              onDelete={handleDeleteRestaurant}
            />
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No restaurants yet</p>
              <p className="text-white/40 text-sm">Click the button above to add your first restaurant</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Restaurant Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-500" />
              Create Restaurant
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 w-full overflow-hidden">
            <RestaurantForm
              onCreate={async data => {
                const r = await createRestaurant(data)
                setRestaurants(prev => [...prev, r])
                return r
              }}
              onRestaurantUpdated={updated => {
                setRestaurants(prev =>
                  prev.map(r =>
                    r.id === updated.id ? updated : r
                  )
                )
                if (selected?.id === updated.id) {
                  setSelected(updated)
                }
              }}
              onComplete={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
