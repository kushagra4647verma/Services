import { supabase } from "../db.js"
import { assertRestaurantOwner } from "../utils/ownershipGuard.js"

/**
 * GET /restaurants/:restaurantId/events
 */
export async function getEvents(req, res) {
  const { restaurantId } = req.params
  const userId = req.user.sub

  await assertRestaurantOwner(restaurantId, userId)

  const { data, error } = await supabase
    .from("restaurantEvents")
    .select("*")
    .eq("restaurantid", restaurantId)

  if (error) return res.status(500).json(error)
  res.json(data)
}

/**
 * POST /restaurants/:restaurantId/events
 */
export async function createEvent(req, res) {
  const { restaurantId } = req.params
  const userId = req.user.sub

  await assertRestaurantOwner(restaurantId, userId)

  const { data, error } = await supabase
    .from("restaurantEvents")
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
 * GET /events/:eventId
 */
export async function getEvent(req, res) {
  const { eventId } = req.params

  const { data, error } = await supabase
    .from("restaurantEvents")
    .select("*")
    .eq("id", eventId)
    .single()

  if (error) return res.status(404).json(error)
  res.json(data)
}

/**
 * PATCH /events/:eventId
 */
export async function updateEvent(req, res) {
  const { eventId } = req.params

  const { data, error } = await supabase
    .from("restaurantEvents")
    .update(req.body)
    .eq("id", eventId)
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.json(data)
}

/**
 * DELETE /events/:eventId
 */
export async function deleteEvent(req, res) {
  const { eventId } = req.params

  const { error } = await supabase
    .from("restaurantEvents")
    .delete()
    .eq("id", eventId)

  if (error) return res.status(500).json(error)
  res.sendStatus(204)
}
