// repositories/restaurantRepo.js
import { supabase } from "../db.js"

export function getRestaurantsByOwner(ownerId) {
  return supabase
    .from("restaurants")
    .select("*")
    .eq("ownerId", ownerId)
}

export function insertRestaurant(payload) {
  return supabase
    .from("restaurants")
    .insert(payload)
    .select()
    .single()
}

export function getRestaurantById(restaurantId) {
  return supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single()
}

export function updateRestaurantById(restaurantId, payload) {
  return supabase
    .from("restaurants")
    .update(payload)
    .eq("id", restaurantId)
    .select()
    .single()
}

export function getRestaurantForDelete(restaurantId, ownerId) {
  return supabase
    .from("restaurants")
    .select("id, foodMenuPics")
    .eq("id", restaurantId)
    .eq("ownerId", ownerId)
    .single()
}

export function deleteRestaurantById(restaurantId, ownerId) {
  return supabase
    .from("restaurants")
    .delete()
    .eq("id", restaurantId)
    .eq("ownerId", ownerId)
}
