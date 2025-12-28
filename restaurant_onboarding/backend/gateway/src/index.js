import cors from "cors"
import express from "express"
import routes from "./routes.js"

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())
app.use(routes)

const PORT = process.env.API_GATEWAY_PORT || 3000
app.listen(PORT, () => {
  console.log(`API Gateway running on ${PORT}`)
})
