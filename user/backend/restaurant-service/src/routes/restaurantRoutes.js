import { Router } from "express"
import {
  getAllRestaurants,
  getTrendingRestaurants,
  getRestaurantById,
  getRestaurantBeverages
} from "../controllers/restaurantController.js"

const router = Router()

router.get("/restaurants", getAllRestaurants)
router.get("/restaurants/trending", getTrendingRestaurants)
router.get("/restaurants/:restaurantId/beverages", getRestaurantBeverages)
router.get("/restaurants/:restaurantId", getRestaurantById)


export default router
