import { supabase } from "../db.js"

export async function assertRestaurantOwner(restaurantId, userId) {
  const { data } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .eq("ownerId", userId)
    .single()

  if (!data) {
    const err = new Error("Forbidden")
    err.statusCode = 403
    throw err
  }
}
