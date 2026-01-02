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

export default function App() {
  const [session, setSession] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

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
    return <div>Loading restaurants...</div>
  }

  return (
    <>
      <button onClick={logout}>Logout</button>

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
    console.log("updated list in App.jsx",restaurants);
  }}
/>




      <RestaurantList
        restaurants={restaurants}
        onSelect={setSelected}
        onDelete={handleDeleteRestaurant} // ✅ pass down
      />

      {selected && (
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
)}

    </>
  )
}
