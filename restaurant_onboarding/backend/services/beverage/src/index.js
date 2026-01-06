import express from "express"
import beverageRoutes from "./routes/beverageRoutes.js"
import { authenticate } from "./middleware/authMiddleware.js"

const app = express()
app.use(express.json())
app.use(authenticate)
app.use(beverageRoutes)

app.listen(5002, () => {
  console.log("Beverage service running on 5002")
})
