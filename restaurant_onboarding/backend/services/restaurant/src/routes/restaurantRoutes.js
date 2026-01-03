import express from "express"
import {
  getMyRestaurants,
  createRestaurantController,
  getRestaurant,
  updateRestaurantController,
  deleteRestaurant
} from "../controllers/restaurantController.js"

// import {
//   getDocuments,
//   updateDocuments
// } from "../controllers/restaurantDocumentsController.js"

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

// // documents
// router.get("/:restaurantId/documents", getDocuments)
// router.patch("/:restaurantId/documents", updateDocuments)

// bank
router.get("/:restaurantId/bank", getBank)
router.patch("/:restaurantId/bank", updateBank)

export default router
