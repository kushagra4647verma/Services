import express from "express"
import {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantLegal,
  getRestaurantBank,
  getRestaurantBeverages,
  getRestaurantEvents,
  getBeverageById,
  getEventById,
  updateRestaurantVerification
} from "../controllers/adminController.js"

const router = express.Router()

// Restaurant routes
router.get("/restaurants", getAllRestaurants)
router.get("/restaurants/:restaurantId", getRestaurantById)
router.patch("/restaurants/:restaurantId/verify", updateRestaurantVerification)
router.get("/restaurants/:restaurantId/legal", getRestaurantLegal)
router.get("/restaurants/:restaurantId/bank", getRestaurantBank)
router.get("/restaurants/:restaurantId/beverages", getRestaurantBeverages)
router.get("/restaurants/:restaurantId/events", getRestaurantEvents)

// Direct beverage/event access
router.get("/beverages/:beverageId", getBeverageById)
router.get("/events/:eventId", getEventById)

export default router
