import express from "express"
import {
  getMyRestaurants,
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant
} from "../controllers/restaurantController.js"

import {
  getDocuments,
  updateDocuments
} from "../controllers/restaurantDocumentsController.js"

import {
  getBank,
  updateBank
} from "../controllers/restaurantBankController.js"

const router = express.Router()

// restaurant core
router.get("/me", getMyRestaurants)
router.post("/", createRestaurant)
router.get("/:restaurantId", getRestaurant)
router.patch("/:restaurantId", updateRestaurant)
router.delete("/:restaurantId", deleteRestaurant)

// documents
router.get("/:restaurantId/documents", getDocuments)
router.patch("/:restaurantId/documents", updateDocuments)

// bank
router.get("/:restaurantId/bank", getBank)
router.patch("/:restaurantId/bank", updateBank)

export default router
