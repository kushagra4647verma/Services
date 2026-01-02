import express from "express"
import dotenv from "dotenv"
import socialRoutes from "./routes/socialRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"

dotenv.config()

const app = express()
app.use(express.json())

app.use("/", socialRoutes)
app.use(errorHandler)

const PORT = 4005
app.listen(PORT, () => {
  console.log(`🤝 Social service running on port ${PORT}`)
})
