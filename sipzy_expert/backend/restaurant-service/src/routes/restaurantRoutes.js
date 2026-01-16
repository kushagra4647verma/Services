import { Router } from "express"
import { expertOrAdminOnly } from "../middleware/roleMiddleware.js"
import {
  getRestaurant,
  getRestaurantBeverages
} from "../controllers/restaurantController.js"

const router = Router()

router.get("/restaurants/:restaurantId", expertOrAdminOnly, getRestaurant)
router.get("/restaurants/:restaurantId/beverages", expertOrAdminOnly, getRestaurantBeverages)

export default router
