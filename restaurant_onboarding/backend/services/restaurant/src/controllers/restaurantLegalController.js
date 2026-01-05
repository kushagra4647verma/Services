import { supabase } from "../db.js"
import { assertRestaurantOwner } from "../utils/ownershipGuard.js"

/**
 * GET /restaurants/:restaurantId/legal
 */
export async function getLegal(req, res) {
  const { restaurantId } = req.params

  await assertRestaurantOwner(req, restaurantId)

  const { data, error } = await supabase
    .from("restaurantLegalInfo")
    .select("*")
    .eq("restaurantid", restaurantId)
    .single()

  if (error && error.code !== "PGRST116") {
    return res.status(500).json(error)
  }

  res.json(data ?? {})
}

/**
 * PATCH /restaurants/:restaurantId/legal
 */
export async function updateLegal(req, res) {
  const { restaurantId } = req.params

  await assertRestaurantOwner(req, restaurantId)

  const { data, error } = await supabase
    .from("restaurantLegalInfo")
    .upsert({
      restaurantid: restaurantId,
      ...req.body
    })
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.json(data)
}
