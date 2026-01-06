import express from "express"
import proxy from "express-http-proxy"

const router = express.Router()

// Admin service proxy (DNS name = docker-compose service key)
const adminService = proxy("http://admin-service:5000", {
  proxyReqPathResolver: req => req.originalUrl
})

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "admin-gateway" })
})

// ---- Admin routes (all go to admin-service) ----

// Restaurants
router.get("/restaurants", adminService)
router.get("/restaurants/:restaurantId", adminService)
router.patch("/restaurants/:restaurantId/verify", adminService)
router.get("/restaurants/:restaurantId/legal", adminService)
router.get("/restaurants/:restaurantId/bank", adminService)
router.get("/restaurants/:restaurantId/beverages", adminService)
router.get("/restaurants/:restaurantId/events", adminService)

// Beverages direct
router.get("/beverages/:beverageId", adminService)

// Events direct
router.get("/events/:eventId", adminService)

export default router
