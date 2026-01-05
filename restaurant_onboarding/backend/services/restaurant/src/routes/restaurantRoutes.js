import express from "express"
import {
  getMyRestaurants,
  createRestaurantController,
  getRestaurant,
  updateRestaurantController,
  deleteRestaurant
} from "../controllers/restaurantController.js"

import {
  getLegal,
  updateLegal
} from "../controllers/restaurantLegalController.js"

import {
  getBank,
  updateBank
} from "../controllers/restaurantBankController.js"

const router = express.Router()

// restaurant core
router.get("/me", getMyRestaurants)
router.post("/", createRestaurantController)
router.get("/:restaurantId", getRestaurant)
router.patch("/:restaurantId", updateRestaurantController)
router.delete("/:restaurantId", deleteRestaurant)

// legal info
router.get("/:restaurantId/legal", getLegal)
router.patch("/:restaurantId/legal", updateLegal)

// bank
router.get("/:restaurantId/bank", getBank)
router.patch("/:restaurantId/bank", updateBank)

export default router
