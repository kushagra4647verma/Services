import express from "express"
import dotenv from "dotenv"
import { authenticate, requireExpertOrAdmin } from "./authMiddleware.js"
import { createProxy } from "./proxy.js"

dotenv.config()
const app = express()

app.use("/experts",
  authenticate,
  requireExpertOrAdmin,
  createProxy(process.env.EXPERT_SERVICE_URL)
)

app.use("/restaurants",
  authenticate,
  requireExpertOrAdmin,
  createProxy(process.env.RESTAURANT_SERVICE_URL)
)

app.listen(4000, () => console.log("🚪 Gateway running"))
