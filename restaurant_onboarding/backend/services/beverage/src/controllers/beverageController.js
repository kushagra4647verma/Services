import { supabase } from "../db.js"
import { assertRestaurantOwner } from "../utils/ownershipGuard.js"

/**
 * Sanitize beverage payload - convert empty strings to null for database compatibility
 */
function sanitizeBeveragePayload(body) {
  const sanitized = { ...body }
  
  // Convert empty strings to null for optional fields
  // Field renames: baseType -> drinkType (Alcoholic/Non-Alcoholic), type -> baseType (style like Margarita)
  const optionalFields = ['category', 'drinkType', 'baseType', 'sizeVol', 'description', 'photo']
  for (const field of optionalFields) {
    if (sanitized[field] === "" || sanitized[field] === undefined) {
      sanitized[field] = null
    }
  }
  
  // Handle price as number or null
  if (sanitized.price === "" || sanitized.price === undefined || sanitized.price === null) {
    sanitized.price = null
  } else if (typeof sanitized.price === 'string') {
    sanitized.price = parseFloat(sanitized.price) || null
  }
  
  // Ensure arrays are properly formatted
  if (!Array.isArray(sanitized.ingredients)) {
    sanitized.ingredients = []
  }
  if (!Array.isArray(sanitized.allergens)) {
    sanitized.allergens = []
  }
  if (!Array.isArray(sanitized.flavorTags)) {
    sanitized.flavorTags = []
  }
  if (!Array.isArray(sanitized.perfectPairing)) {
    sanitized.perfectPairing = []
  }
  
  return sanitized
}

/**
 * GET /restaurants/:restaurantId/beverages
 */
export async function getBeverages(req, res) {
  const { restaurantId } = req.params
  const userId = req.user.sub

  try {
    await assertRestaurantOwner(restaurantId, userId)
  } catch (err) {
    return res.status(err.statusCode || 403).json({ error: err.message })
  }

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

  try {
    await assertRestaurantOwner(restaurantId, userId)
  } catch (err) {
    return res.status(err.statusCode || 403).json({ error: err.message })
  }

  const sanitizedBody = sanitizeBeveragePayload(req.body)

  const { data, error } = await supabase
    .from("beverages")
    .insert({
      ...sanitizedBody,
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

  const sanitizedBody = sanitizeBeveragePayload(req.body)

  const { data, error } = await supabase
    .from("beverages")
    .update(sanitizedBody)
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
