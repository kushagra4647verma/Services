import { supabase } from "../db.js"
import { assertRestaurantOwner } from "../utils/ownershipGuard.js"

/**
 * Sanitize event payload - convert empty strings to null for database compatibility
 */
function sanitizeEventPayload(body) {
  const sanitized = { ...body }
  
  // Convert empty strings to null for date/time fields
  if (sanitized.eventDate === "" || sanitized.eventDate === undefined) {
    sanitized.eventDate = null
  }
  if (sanitized.eventTime === "" || sanitized.eventTime === undefined) {
    sanitized.eventTime = null
  }
  if (sanitized.bookingLink === "" || sanitized.bookingLink === undefined) {
    sanitized.bookingLink = null
  }
  if (sanitized.description === "" || sanitized.description === undefined) {
    sanitized.description = null
  }
  if (sanitized.photo === "" || sanitized.photo === undefined) {
    sanitized.photo = null
  }
  
  return sanitized
}

/**
 * GET /restaurants/:restaurantId/events
 */
export async function getEvents(req, res) {
  const { restaurantId } = req.params
  const userId = req.user.sub

  try {
    await assertRestaurantOwner(restaurantId, userId)
  } catch (err) {
    return res.status(err.statusCode || 403).json({ error: err.message })
  }

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

  try {
    await assertRestaurantOwner(restaurantId, userId)
  } catch (err) {
    return res.status(err.statusCode || 403).json({ error: err.message })
  }

  const sanitizedBody = sanitizeEventPayload(req.body)

  const { data, error } = await supabase
    .from("restaurantEvents")
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

  const sanitizedBody = sanitizeEventPayload(req.body)

  const { data, error } = await supabase
    .from("restaurantEvents")
    .update(sanitizedBody)
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
