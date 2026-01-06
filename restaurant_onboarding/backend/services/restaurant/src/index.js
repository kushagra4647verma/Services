import express from "express"
import restaurantRoutes from "./routes/restaurantRoutes.js"
import { authenticate } from "./middleware/authMiddleware.js"

const app = express()
app.use(express.json())

// Debug: Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`)
  next()
})

// apply auth BEFORE routes
app.use(authenticate)

// Mount routes at /restaurants - gateway sends full path like /restaurants/me
app.use("/restaurants", restaurantRoutes)

// 404 handler
app.use((req, res) => {
  console.log(`404: No route for [${req.method}] ${req.originalUrl}`)
  res.status(404).json({ error: "Not found" })
})

app.listen(4001, () => {
  console.log("Restaurant service running on 4001")
})
