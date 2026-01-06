import express from "express"
import cors from "cors"
import adminRoutes from "./routes/adminRoutes.js"

const app = express()

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}))

app.use(express.json())

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Admin Service] ${req.method} ${req.originalUrl}`)
  next()
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "admin-service" })
})

// Mount admin routes
app.use(adminRoutes)

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`)
})
