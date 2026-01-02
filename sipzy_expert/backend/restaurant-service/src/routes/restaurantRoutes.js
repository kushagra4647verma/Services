import { Router } from "express"
import { expertOnly } from "../middleware/roleMiddleware.js"
import {
  getRestaurant,
  getRestaurantBeverages
} from "../controllers/restaurantController.js"

const router = Router()

router.get("/restaurants/:restaurantId", expertOnly, getRestaurant)
router.get("/restaurants/:restaurantId/beverages", expertOnly, getRestaurantBeverages)

export default router
