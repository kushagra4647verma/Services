import crypto from "crypto"
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

/**
 * GET /beverages/user/all
 * Get all beverages for the current user across all their restaurants
 */
export async function getAllUserBeverages(req, res) {
  const userId = req.user.sub

  try {
    // First get all restaurants owned by user
    const { data: restaurants, error: restError } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("ownerId", userId)

    if (restError) return res.status(500).json(restError)

    if (!restaurants || restaurants.length === 0) {
      return res.json([])
    }

    const restaurantIds = restaurants.map(r => r.id)
    const restaurantMap = Object.fromEntries(restaurants.map(r => [r.id, r.name]))

    // Get all beverages for these restaurants
    const { data: beverages, error: bevError } = await supabase
      .from("beverages")
      .select("*")
      .in("restaurantid", restaurantIds)

    if (bevError) return res.status(500).json(bevError)

    // Add restaurant name to each beverage
    const beveragesWithRestaurant = (beverages || []).map(b => ({
      ...b,
      restaurantName: restaurantMap[b.restaurantid] || "Unknown"
    }))

    res.json(beveragesWithRestaurant)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch beverages" })
  }
}

/**
 * Helper function to copy a file from one restaurant's storage to another
 * @param {string} sourceUrl - The public URL of the source file
 * @param {string} targetRestaurantId - The target restaurant ID
 * @returns {Promise<string|null>} - The new public URL or null if failed
 */
async function copyStorageFile(sourceUrl, targetRestaurantId) {
  if (!sourceUrl) return null

  try {
    // Extract the file path from the URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/test2/restaurants/{restaurantId}/{filename}
    const urlObj = new URL(sourceUrl)
    const pathParts = urlObj.pathname.split("/test2/")
    
    if (pathParts.length < 2) {
      console.error("Could not parse storage URL:", sourceUrl)
      return null
    }

    const sourcePath = decodeURIComponent(pathParts[1])
    
    // Download the file from source
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("test2")
      .download(sourcePath)

    if (downloadError) {
      console.error("Failed to download source file:", downloadError)
      return null
    }

    // Generate new filename with UUID
    const originalFileName = sourcePath.split("/").pop()
    const fileExt = originalFileName.split(".").pop()
    const newFileName = `${crypto.randomUUID()}.${fileExt}`
    const targetPath = `restaurants/${targetRestaurantId}/${newFileName}`

    // Upload to target location
    const { error: uploadError } = await supabase.storage
      .from("test2")
      .upload(targetPath, fileData, {
        contentType: fileData.type || "application/octet-stream",
        upsert: false
      })

    if (uploadError) {
      console.error("Failed to upload to target:", uploadError)
      return null
    }

    // Get the public URL of the new file
    const { data: publicUrlData } = supabase.storage
      .from("test2")
      .getPublicUrl(targetPath)

    return publicUrlData.publicUrl
  } catch (err) {
    console.error("Error copying storage file:", err)
    return null
  }
}

/**
 * POST /restaurants/:restaurantId/beverages/copy-from/:sourceRestaurantId
 * Copy all beverages from source restaurant to target restaurant
 */
export async function copyBeveragesFromRestaurant(req, res) {
  const { restaurantId, sourceRestaurantId } = req.params
  const userId = req.user.sub

  try {
    // Verify ownership of both restaurants
    await assertRestaurantOwner(restaurantId, userId)
    await assertRestaurantOwner(sourceRestaurantId, userId)

    // Get all beverages from source restaurant
    const { data: sourceBeverages, error: fetchError } = await supabase
      .from("beverages")
      .select("*")
      .eq("restaurantid", sourceRestaurantId)

    if (fetchError) return res.status(500).json(fetchError)

    if (!sourceBeverages || sourceBeverages.length === 0) {
      return res.json({ copied: 0, beverages: [] })
    }

    // Prepare beverages for insertion - copy images to new restaurant's storage
    const beveragesToInsert = await Promise.all(
      sourceBeverages.map(async (b) => {
        const { id, createdAt, updatedAt, restaurantid, photo, ...rest } = b
        
        // Copy the photo to the new restaurant's storage
        const newPhotoUrl = await copyStorageFile(photo, restaurantId)
        
        return {
          ...rest,
          photo: newPhotoUrl,
          restaurantid: restaurantId
        }
      })
    )

    // Insert all beverages
    const { data: insertedBeverages, error: insertError } = await supabase
      .from("beverages")
      .insert(beveragesToInsert)
      .select()

    if (insertError) return res.status(500).json(insertError)

    res.status(201).json({
      copied: insertedBeverages.length,
      beverages: insertedBeverages
    })
  } catch (err) {
    console.error(err)
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    res.status(500).json({ error: "Failed to copy beverages" })
  }
}
