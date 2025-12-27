import { supabase } from "../db.js"

/**
 * GET /restaurants/me
 */
export async function getMyRestaurants(req, res) {
  const ownerId = req.user.sub

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("ownerId", ownerId)

  if (error) return res.status(500).json(error)
  res.json(data)
}

/**
 * POST /restaurants
 */
export async function createRestaurant(req, res) {
  const ownerId = req.user.sub

  const { data, error } = await supabase
    .from("restaurants")
    .insert({ ...req.body, ownerId })
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.status(201).json(data)
}

/**
 * GET /restaurants/:restaurantId
 */
export async function getRestaurant(req, res) {
  const { restaurantId } = req.params

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single()

  if (error) return res.status(404).json(error)
  res.json(data)
}

/**
 * PATCH /restaurants/:restaurantId
 */
export async function updateRestaurant(req, res) {
  const { restaurantId } = req.params

  const { data, error } = await supabase
    .from("restaurants")
    .update(req.body)
    .eq("id", restaurantId)
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.json(data)
}

/**
 * DELETE /restaurants/:restaurantId
 */
export async function deleteRestaurant(req, res) {
  const { restaurantId } = req.params

  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", restaurantId)

  if (error) return res.status(500).json(error)
  res.sendStatus(204)
}
