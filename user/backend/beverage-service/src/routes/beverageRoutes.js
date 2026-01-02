import { Router } from "express"
import {
  getBeverageById,
  getBeverageRatings,
  addUserRating
} from "../controllers/beverageController.js"

const router = Router()

router.get("/beverages/:beverageId", getBeverageById)
router.get("/beverages/:beverageId/ratings", getBeverageRatings)
router.post("/beverages/:beverageId/ratings", addUserRating)

export default router
