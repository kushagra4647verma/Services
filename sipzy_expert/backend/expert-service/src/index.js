import express from "express"
import dotenv from "dotenv"
import expertRoutes from "./routes/expertRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"
import { expertOrAdminOnly } from "./middleware/roleMiddleware.js"

dotenv.config()

const app = express()
app.use(express.json())

// 🔐 Role check applied to all restaurant routes
app.use("/", expertOrAdminOnly, expertRoutes)

app.use(errorHandler)

const PORT = 4002
app.listen(PORT, () => {
  console.log(`🍽️ Expert service running on port ${PORT}`)
})
