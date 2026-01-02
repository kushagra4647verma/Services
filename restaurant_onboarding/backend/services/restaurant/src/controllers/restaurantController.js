// controllers/restaurantController.js
import {
  fetchMyRestaurants,
  createRestaurant,
  fetchRestaurant,
  updateRestaurant,
  removeRestaurant
} from "../services/restaurantService.js"

/**
 * GET /restaurants/me
 */
export async function getMyRestaurants(req, res) {
  try {
    const ownerId = req.user.sub
    const data = await fetchMyRestaurants(ownerId)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * POST /restaurants
 */
export async function createRestaurantController(req, res) {
  try {
    const ownerId = req.user.sub
    const data = await createRestaurant(ownerId, req.body)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

/**
 * GET /restaurants/:restaurantId
 */
export async function getRestaurant(req, res) {
  try {
    const data = await fetchRestaurant(req.params.restaurantId)
    res.json(data)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

/**
 * PATCH /restaurants/:restaurantId
 */
export async function updateRestaurantController(req, res) {
  try {
    const data = await updateRestaurant(
      req.params.restaurantId,
      req.body
    )
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * DELETE /restaurants/:restaurantId
 */
export async function deleteRestaurant(req, res) {
  try {
    await removeRestaurant(
      req.params.restaurantId,
      req.user.sub
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
