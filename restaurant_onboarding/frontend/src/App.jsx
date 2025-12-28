import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import Login from "./components/auth/Login"
import RestaurantList from "./components/restaurants/RestaurantList"
import RestaurantForm from "./components/restaurants/RestaurantForm"
import RestaurantDetail from "./components/restaurants/RestaurantDetail"
import { getMyRestaurants, createRestaurant } from "./api/restaurants"

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
        onSave={async data => {
          const r = await createRestaurant(data)
          setRestaurants(prev => [...prev, r])
        }}
      />

      <RestaurantList
        restaurants={restaurants}
        onSelect={setSelected}
      />

      {selected && <RestaurantDetail restaurant={selected} />}
    </>
  )
}
