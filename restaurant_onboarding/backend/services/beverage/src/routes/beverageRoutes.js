import express from "express"
import {
  getBeverages,
  createBeverage,
  getBeverage,
  updateBeverage,
  deleteBeverage
} from "../controllers/beverageController.js"

const router = express.Router()

router.get("/restaurants/:restaurantId/beverages", getBeverages)
router.post("/restaurants/:restaurantId/beverages", createBeverage)

router.get("/beverages/:beverageId", getBeverage)
router.patch("/beverages/:beverageId", updateBeverage)
router.delete("/beverages/:beverageId", deleteBeverage)

export default router
