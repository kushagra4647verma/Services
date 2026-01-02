import express from "express"
import dotenv from "dotenv"
import beverageRoutes from "./routes/beverageRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"

dotenv.config()

const app = express()
app.use(express.json())

app.use("/", beverageRoutes)
app.use(errorHandler)

const PORT = 4002
app.listen(PORT, () => {
  console.log(`🥤 Beverage service running on port ${PORT}`)
})
