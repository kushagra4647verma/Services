import cors from "cors"
import express from "express"
import routes from "./routes.js"

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}))

app.use(express.json())

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`)
  next()
})

app.use(routes)

const PORT = process.env.API_GATEWAY_PORT || 3000
app.listen(PORT, () => {
  console.log(`API Gateway running on ${PORT}`)
})
