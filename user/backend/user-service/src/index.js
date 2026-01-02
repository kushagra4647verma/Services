import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"

dotenv.config()

const app = express()
app.use(express.json())

app.use("/", userRoutes)
app.use(errorHandler)

const PORT = 4004
app.listen(PORT, () => {
  console.log(`👤 User service running on port ${PORT}`)
})
