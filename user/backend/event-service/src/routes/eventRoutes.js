import { Router } from "express"
import {
  getAllUpcomingEvents,
  getEventById
} from "../controllers/eventController.js"

const router = Router()

router.get("/events", getAllUpcomingEvents)
router.get("/events/:eventId", getEventById)

export default router
