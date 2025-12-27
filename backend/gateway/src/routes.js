import express from "express"
import proxy from "express-http-proxy"
import { authenticate } from "./authMiddleware.js"

const router = express.Router()

const restaurantService = proxy("http://restaurant-service:4001", {
  proxyReqPathResolver: req => req.originalUrl
})

router.use("/restaurants", authenticate, restaurantService)

export default router
