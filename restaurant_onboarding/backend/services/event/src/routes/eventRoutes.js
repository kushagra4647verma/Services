import express from "express"
import {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent
} from "../controllers/eventController.js"

const router = express.Router()

router.get("/restaurants/:restaurantId/events", getEvents)
router.post("/restaurants/:restaurantId/events", createEvent)

router.get("/events/:eventId", getEvent)
router.patch("/events/:eventId", updateEvent)
router.delete("/events/:eventId", deleteEvent)

export default router
