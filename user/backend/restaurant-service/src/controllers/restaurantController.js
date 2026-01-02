import * as restaurantService from "../services/restaurantService.js"
import { success } from "../utils/response.js"

export async function getAllRestaurants(req, res, next) {
  try {
    const data = await restaurantService.fetchAllVerifiedRestaurants()
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getTrendingRestaurants(req, res, next) {
  try {
    const data = await restaurantService.fetchTrendingRestaurants()
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getRestaurantById(req, res, next) {
  try {
    const { restaurantId } = req.params
    const data = await restaurantService.fetchRestaurantDetails(restaurantId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}

export async function getRestaurantBeverages(req, res, next) {
  try {
    const { restaurantId } = req.params
    const data = await restaurantService.fetchRestaurantBeverages(restaurantId)
    res.json(success(data))
  } catch (err) {
    next(err)
  }
}
