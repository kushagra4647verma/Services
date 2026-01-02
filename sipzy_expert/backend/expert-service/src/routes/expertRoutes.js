import { Router } from "express"
import {
  getAssignedRestaurants,
  rateBeverage
} from "../controllers/expertController.js"

const router = Router()

router.get("/experts/restaurants/:expertId", getAssignedRestaurants)
router.post("/expert/ratings/:beverageId", rateBeverage)

export default router
