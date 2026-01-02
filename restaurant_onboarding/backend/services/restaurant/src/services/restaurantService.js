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
  return `SRID=4326;POINT(${location.lng} ${location.lat})`
}

/* READS */

export async function fetchMyRestaurants(ownerId) {
  const { data, error } = await getRestaurantsByOwner(ownerId)
  if (error) throw error
  return data
}

export async function fetchRestaurant(restaurantId) {
  const { data, error } = await getRestaurantById(restaurantId)
  if (error) throw error
  return data
}

/* WRITES */

export async function createRestaurant(ownerId, body) {
  const payload = {
    name: body.name,
    bio: body.bio,
    ownerId,
    foodMenuPics: body.foodMenuPics,
    location: toGeographyPoint(body.location)
  }

  const { data, error } = await insertRestaurant(payload)
  if (error) throw error
  return data
}

export async function updateRestaurant(restaurantId, body) {
  const updatePayload = {}

  if (body.name) updatePayload.name = body.name
  if (body.bio) updatePayload.bio = body.bio
  if (body.foodMenuPics) updatePayload.foodMenuPics = body.foodMenuPics
  if (body.location)
    updatePayload.location = toGeographyPoint(body.location)

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
