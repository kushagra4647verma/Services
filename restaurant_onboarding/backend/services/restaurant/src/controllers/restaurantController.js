import { supabase } from "../db.js"

import { deleteStorageFiles } from "../utils/deleteStorageFiles.js"


function toGeographyPoint(location) {
  if (!location) return null
  return `SRID=4326;POINT(${location.lng} ${location.lat})`
}


/**
 * GET /restaurants/me
 */
export async function getMyRestaurants(req, res) {
  // console.log("request body in get restaurants:", req);  //testing
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
  try {
    const ownerId = req.user.sub   // ✅ ADD THIS LINE

    const { name, bio, foodMenuPics, location } = req.body

    const payload = {
      name,
      bio,
      ownerId,
      foodMenuPics,
      location: toGeographyPoint(location)
    }

    console.log("Creating restaurant:", payload)

    const { data, error } = await supabase
      .from("restaurants")
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error(error)
      return res.status(400).json({ error: error.message })
    }

    return res.json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * GET /restaurants/:restaurantId
 */
export async function getRestaurant(req, res) {
    // console.log("request body in get 1 restaurant:", req);  //testing
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

  const updatePayload = {}             //ADD MORE FIELDS

if (req.body.name) updatePayload.name = req.body.name
if (req.body.bio) updatePayload.bio = req.body.bio
if (req.body.foodMenuPics)
  updatePayload.foodMenuPics = req.body.foodMenuPics
if (req.body.location)
  updatePayload.location = toGeographyPoint(req.body.location)

const { data, error } = await supabase
  .from("restaurants")
  .update(updatePayload)
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
  try {
    const { restaurantId } = req.params
    const ownerId = req.user.sub

    // 1. Fetch restaurant (ownership enforced)
    const { data: restaurant, error: fetchError } = await supabase
      .from("restaurants")
      .select("id, foodMenuPics")
      .eq("id", restaurantId)
      .eq("ownerId", ownerId)
      .single()

    if (fetchError || !restaurant) {
      return res.status(404).json({ error: "Restaurant not found" })
    }

    // 2. Delete files from storage
    console.log("Files to delete:", restaurant.foodMenuPics)

    await deleteStorageFiles(restaurant.foodMenuPics || [])

    // 3. Delete restaurant row
    const { error: deleteError } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", restaurantId)
      .eq("ownerId", ownerId)

    if (deleteError) {
      throw deleteError
    }

    return res.json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Failed to delete restaurant" })
  }
}

