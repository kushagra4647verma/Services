import express from "express"
import proxy from "express-http-proxy"
import { authenticate } from "./authMiddleware.js"

const router = express.Router()

// ---- service proxies (DNS name = docker-compose service key) ----
const restaurantService = proxy("http://restaurant-service:4001", {
  proxyReqPathResolver: req => req.originalUrl
})

const beverageService = proxy("http://beverage-service:4002", {
  proxyReqPathResolver: req => req.originalUrl
})

const eventService = proxy("http://event-service:4003", {
  proxyReqPathResolver: req => req.originalUrl
})

// ---- routing ----


// beverages
router.use(
  ["/restaurants/:restaurantId/beverages", "/beverages"],
  authenticate,
  beverageService
)

// events
router.use(
  ["/restaurants/:restaurantId/events", "/events"],
  authenticate,
  eventService
)

// restaurant core + documents + bank
router.use("/restaurants", authenticate, restaurantService)

export default router
