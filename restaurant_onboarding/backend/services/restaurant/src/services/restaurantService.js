// services/restaurantService.js
import {
  getRestaurantsByOwner,
  insertRestaurant,
  getRestaurantById,
  updateRestaurantById,
  getRestaurantForDelete,
  deleteRestaurantById
} from "../repositories/restaurantRepo.js"

import { deleteStorageFiles } from "../utils/deleteStorageFiles.js"

function toGeographyPoint(location) {
  if (!location) return null
  // Validate that location has valid lat and lng numbers
  if (typeof location.lat !== 'number' || typeof location.lng !== 'number') return null
  if (isNaN(location.lat) || isNaN(location.lng)) return null
  return `SRID=4326;POINT(${location.lng} ${location.lat})`
}

/**
 * Parse PostGIS WKB hex format to {lat, lng}
 * Format: 0101000020E6100000[lng 8 bytes][lat 8 bytes]
 * The hex string contains little-endian doubles for lng and lat
 */
function parseWkbHexToLatLng(wkbHex) {
  if (!wkbHex || typeof wkbHex !== 'string') return null
  
  try {
    // WKB Point with SRID format:
    // 01 - little endian
    // 01000020 - Point type with SRID flag
    // E6100000 - SRID 4326
    // Then 16 bytes (32 hex chars) for lng (8 bytes) + lat (8 bytes)
    
    // The coordinates start at position 18 (after the header)
    const coordsHex = wkbHex.substring(18)
    
    if (coordsHex.length < 32) return null
    
    // Parse little-endian doubles
    const lngHex = coordsHex.substring(0, 16)
    const latHex = coordsHex.substring(16, 32)
    
    const lng = parseHexToDouble(lngHex)
    const lat = parseHexToDouble(latHex)
    
    if (isNaN(lat) || isNaN(lng)) return null
    
    return { lat, lng }
  } catch (e) {
    console.error("Error parsing WKB:", e)
    return null
  }
}

/**
 * Parse 16-char hex string to IEEE 754 double (little-endian)
 */
function parseHexToDouble(hex) {
  // Convert hex pairs to bytes (little-endian, so reverse)
  const bytes = []
  for (let i = 0; i < 16; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  
  // Create a buffer and read as float64 little-endian
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  bytes.forEach((b, i) => view.setUint8(i, b))
  
  return view.getFloat64(0, true) // true = little-endian
}

/**
 * Transform restaurant data to convert WKB location to lat/lng
 */
function transformRestaurant(restaurant) {
  if (!restaurant) return restaurant
  
  if (restaurant.location && typeof restaurant.location === 'string') {
    restaurant.location = parseWkbHexToLatLng(restaurant.location)
  }
  
  return restaurant
}

/* READS */

export async function fetchMyRestaurants(ownerId) {
  const { data, error } = await getRestaurantsByOwner(ownerId)
  if (error) throw error
  return data.map(transformRestaurant)
}

export async function fetchRestaurant(restaurantId) {
  const { data, error } = await getRestaurantById(restaurantId)
  if (error) throw error
  return transformRestaurant(data)
}

/* WRITES */

export async function createRestaurant(ownerId, body) {
  const payload = {
    name: body.name,
    bio: body.bio,
    ownerId,
    phone: body.phone,
    address: body.address,
    location: toGeographyPoint(body.location),
    logoImage: body.logoImage,
    coverImage: body.coverImage,
    gallery: body.gallery,
    foodMenuPics: body.foodMenuPics,
    cuisineTags: body.cuisineTags,
    amenities: body.amenities,
    priceRange: body.priceRange,
    hasReservation: body.hasReservation,
    reservationLink: body.reservationLink,
    openingHours: body.openingHours,
    instaLink: body.instaLink,
    facebookLink: body.facebookLink,
    twitterLink: body.twitterLink,
    googleMapsLink: body.googleMapsLink
  }

  // Remove undefined values
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) delete payload[key]
  })

  const { data, error } = await insertRestaurant(payload)
  if (error) throw error
  return data
}

export async function updateRestaurant(restaurantId, body) {
  const updatePayload = {}

  // Basic info
  if (body.name !== undefined) updatePayload.name = body.name
  if (body.bio !== undefined) updatePayload.bio = body.bio
  if (body.phone !== undefined) updatePayload.phone = body.phone
  if (body.address !== undefined) updatePayload.address = body.address
  if (body.location !== undefined)
    updatePayload.location = toGeographyPoint(body.location)

  // Branding
  if (body.logoImage !== undefined) updatePayload.logoImage = body.logoImage
  if (body.coverImage !== undefined) updatePayload.coverImage = body.coverImage
  if (body.gallery !== undefined) updatePayload.gallery = body.gallery
  if (body.foodMenuPics !== undefined) updatePayload.foodMenuPics = body.foodMenuPics

  // Details
  if (body.cuisineTags !== undefined) updatePayload.cuisineTags = body.cuisineTags
  if (body.amenities !== undefined) updatePayload.amenities = body.amenities
  if (body.priceRange !== undefined) updatePayload.priceRange = body.priceRange
  if (body.hasReservation !== undefined) updatePayload.hasReservation = body.hasReservation
  if (body.reservationLink !== undefined) updatePayload.reservationLink = body.reservationLink
  if (body.openingHours !== undefined) updatePayload.openingHours = body.openingHours

  // Social links
  if (body.instaLink !== undefined) updatePayload.instaLink = body.instaLink
  if (body.facebookLink !== undefined) updatePayload.facebookLink = body.facebookLink
  if (body.twitterLink !== undefined) updatePayload.twitterLink = body.twitterLink
  if (body.googleMapsLink !== undefined) updatePayload.googleMapsLink = body.googleMapsLink

  const { data, error } = await updateRestaurantById(
    restaurantId,
    updatePayload
  )

  if (error) throw error
  return data
}

export async function removeRestaurant(restaurantId, ownerId) {
  const { data: restaurant, error } =
    await getRestaurantForDelete(restaurantId, ownerId)

  if (error || !restaurant) {
    throw new Error("Restaurant not found")
  }

  await deleteStorageFiles(restaurant.foodMenuPics || [])

  const { error: deleteError } =
    await deleteRestaurantById(restaurantId, ownerId)

  if (deleteError) throw deleteError

  return true
}
