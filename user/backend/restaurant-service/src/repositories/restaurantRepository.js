import { supabase } from "../db.js"

export async function getVerifiedRestaurants() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("isVerified", true)

  if (error) throw error
  return data
}

export async function getTrendingRestaurants() {
  const { data, error } = await supabase
    .from("trendingRestaurants")
    .select(`
      restaurantId,
      restaurants (*)
    `)

  if (error) throw error
  return data.map(r => r.restaurants)
}

export async function getRestaurantById(restaurantId) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("restaurantId", restaurantId)
    .eq("isVerified", true)
    .single()

  if (error) return null
  return data
}

export async function getRestaurantDocuments(restaurantId) {
  const { data, error } = await supabase
    .from("restaurantDocuments")
    .select("*")
    .eq("restaurantId", restaurantId)
    .single()

  if (error) return null
  return data
}

export async function getRestaurantBeverages(restaurantId) {
  const { data, error } = await supabase
    .from("beverages")
    .select("*")
    .eq("restaurantId", restaurantId)

  if (error) throw error
  return data
}
