import express from "express"
import {
  getBeverages,
  createBeverage,
  getBeverage,
  updateBeverage,
  deleteBeverage,
  getAllUserBeverages,
  copyBeveragesFromRestaurant
} from "../controllers/beverageController.js"

const router = express.Router()

// User's all beverages (must be before :beverageId routes)
router.get("/beverages/user/all", getAllUserBeverages)

router.get("/restaurants/:restaurantId/beverages", getBeverages)
router.post("/restaurants/:restaurantId/beverages", createBeverage)
router.post("/restaurants/:restaurantId/beverages/copy-from/:sourceRestaurantId", copyBeveragesFromRestaurant)

router.get("/beverages/:beverageId", getBeverage)
router.patch("/beverages/:beverageId", updateBeverage)
router.delete("/beverages/:beverageId", deleteBeverage)

export default router
