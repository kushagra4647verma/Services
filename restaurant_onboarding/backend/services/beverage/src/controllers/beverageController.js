import { supabase } from "../db.js"
import { assertRestaurantOwner } from "../utils/ownershipGuard.js"

/**
 * GET /restaurants/:restaurantId/beverages
 */
export async function getBeverages(req, res) {
  const { restaurantId } = req.params
  const userId = req.user.sub

  await assertRestaurantOwner(restaurantId, userId)

  const { data, error } = await supabase
    .from("beverages")
    .select("*")
    .eq("restaurantid", restaurantId)

  if (error) return res.status(500).json(error)
  res.json(data)
}

/**
 * POST /restaurants/:restaurantId/beverages
 */
export async function createBeverage(req, res) {
  const { restaurantId } = req.params
  const userId = req.user.sub

  await assertRestaurantOwner(restaurantId, userId)

  const { data, error } = await supabase
    .from("beverages")
    .insert({
      ...req.body,
      restaurantid: restaurantId
    })
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.status(201).json(data)
}

/**
 * GET /beverages/:beverageId
 */
export async function getBeverage(req, res) {
  const { beverageId } = req.params

  const { data, error } = await supabase
    .from("beverages")
    .select("*")
    .eq("id", beverageId)
    .single()

  if (error) return res.status(404).json(error)
  res.json(data)
}

/**
 * PATCH /beverages/:beverageId
 */
export async function updateBeverage(req, res) {
  const { beverageId } = req.params

  const { data, error } = await supabase
    .from("beverages")
    .update(req.body)
    .eq("id", beverageId)
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.json(data)
}

/**
 * DELETE /beverages/:beverageId
 */
export async function deleteBeverage(req, res) {
  const { beverageId } = req.params

  const { error } = await supabase
    .from("beverages")
    .delete()
    .eq("id", beverageId)

  if (error) return res.status(500).json(error)
  res.sendStatus(204)
}
