import express from "express"
import eventRoutes from "./routes/eventRoutes.js"
import { authenticate } from "./middleware/authMiddleware.js"

const app = express()
app.use(express.json())
app.use(authenticate)
app.use(eventRoutes)

app.listen(4003, () => {
  console.log("Event service running on 4003")
})
