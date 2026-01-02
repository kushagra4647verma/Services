import express from "express"
import dotenv from "dotenv"
import eventRoutes from "./routes/eventRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"

dotenv.config()

const app = express()
app.use(express.json())

app.use("/", eventRoutes)
app.use(errorHandler)

const PORT = 4003
app.listen(PORT, () => {
  console.log(`🎉 Event service running on port ${PORT}`)
})
