import express from "express"
import dotenv from "dotenv"
import restaurantRoutes from "./routes/restaurantRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"
import { expertOrAdminOnly } from "./middleware/roleMiddleware.js"

dotenv.config()

const app = express()
app.use(express.json())

// 🔐 Role check applied to all restaurant routes
app.use("/", expertOrAdminOnly, restaurantRoutes)

app.use(errorHandler)

const PORT = 4001
app.listen(PORT, () => {
  console.log(`🍽️ Restaurant service running on port ${PORT}`)
})
