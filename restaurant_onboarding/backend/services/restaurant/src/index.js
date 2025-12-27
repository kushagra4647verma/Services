import express from "express"
import restaurantRoutes from "./routes/restaurantRoutes.js"
import { authenticate } from "./middleware/authMiddleware.js"

const app = express()
app.use(express.json())

// apply auth BEFORE routes
app.use(authenticate)   //we can remove this i think 

app.use("/restaurants", restaurantRoutes)

app.listen(4001, () => {
  console.log("Restaurant service running on 4001")
})
