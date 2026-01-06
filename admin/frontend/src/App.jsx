import { useEffect, useState } from "react"
import Login from "./components/auth/Login"
import RestaurantList from "./components/restaurants/RestaurantList"
import RestaurantDetail from "./components/restaurants/RestaurantDetail"
import { getAllRestaurants } from "./api/restaurants"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Store, LogOut, ArrowLeft, RefreshCw } from "lucide-react"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if already authenticated (sessionStorage)
  useEffect(() => {
    document.documentElement.classList.add("dark")
    
    const auth = sessionStorage.getItem("adminAuth")
    if (auth === "true") {
      setIsAuthenticated(true)
      loadRestaurants()
    } else {
      setLoading(false)
    }
  }, [])

  async function loadRestaurants() {
    setLoading(true)
    try {
      const data = await getAllRestaurants()
      setRestaurants(data || [])
    } catch (err) {
      console.error("Failed to load restaurants:", err)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  function handleLogin() {
    setIsAuthenticated(true)
    loadRestaurants()
  }

  function handleLogout() {
    sessionStorage.removeItem("adminAuth")
    setIsAuthenticated(false)
    setRestaurants([])
    setSelected(null)
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo/Back */}
            <div className="flex items-center gap-4">
              {selected ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(null)}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg">Admin Portal</h1>
                    <p className="text-white/50 text-xs">SipZy Restaurant Management</p>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Title (when viewing detail) */}
            {selected && (
              <h1 className="text-white font-semibold hidden md:block">
                {selected.name}
              </h1>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {!selected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadRestaurants}
                  className="text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {selected ? (
          // Detail View
          <RestaurantDetail 
            restaurant={selected} 
            onRestaurantUpdated={(updated) => {
              setSelected(updated)
              setRestaurants(prev => prev.map(r => r.id === updated.id ? updated : r))
            }}
          />
        ) : (
          // List View
          <div className="space-y-6">
            {/* Stats */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Store className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-white/50 text-sm">Total Restaurants</p>
                  <p className="text-white text-3xl font-bold">{restaurants.length}</p>
                </div>
              </div>
            </div>

            {/* Restaurant List */}
            {restaurants.length > 0 ? (
              <RestaurantList
                restaurants={restaurants}
                onSelect={setSelected}
              />
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No Restaurants Found</h3>
                <p className="text-white/50">No restaurants have been uploaded yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
