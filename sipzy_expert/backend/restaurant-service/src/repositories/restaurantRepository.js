import { supabase } from "../db.js"

export async function fetchRestaurant(id) {
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("restaurantId", id)
    .single()
  return data
}

export async function fetchBeverages(id) {
  const { data } = await supabase
    .from("beverages")
    .select("*")
    .eq("restaurantId", id)
  return data
}
