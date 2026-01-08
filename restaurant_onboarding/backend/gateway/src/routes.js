import express from "express"
import proxy from "express-http-proxy"
import crypto from "crypto"
import { authenticate } from "./authMiddleware.js"

const router = express.Router()

// ---- service proxies (DNS name = docker-compose service key) ----
// NOTE: For DigitalOcean deployment, use these hostnames:
//   - onboarding-restaurant-service:5001
//   - onboarding-beverage-service:5002
//   - onboarding-event-service:5003
const restaurantService = proxy("http://onboarding-restaurant-service:5001", {
  proxyReqPathResolver: req => req.originalUrl
})

const beverageService = proxy("http://onboarding-beverage-service:5002", {
  proxyReqPathResolver: req => req.originalUrl
})

const eventService = proxy("http://onboarding-event-service:5003", {
  proxyReqPathResolver: req => req.originalUrl
})

// ---- SMS Hook for Supabase Custom SMS ----

// In-memory OTP store for development (phone -> { otp, timestamp })
const otpStore = new Map()

// Clean up old OTPs every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [phone, data] of otpStore) {
    if (now - data.timestamp > 5 * 60 * 1000) {
      otpStore.delete(phone)
    }
  }
}, 5 * 60 * 1000)

/**
 * Verify Supabase webhook signature
 */
function verifySupabaseSignature(payload, signature, secret) {
  if (!secret || !signature) return false
  
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(JSON.stringify(payload))
  const expectedSignature = hmac.digest("hex")
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Send SMS via MessageBot API
 */
async function sendSmsViaMessageBot(phone, message) {
  const MESSAGEBOT_API_URL = process.env.MESSAGEBOT_API_URL
  const MESSAGEBOT_API_KEY = process.env.MESSAGEBOT_API_KEY
  const MESSAGEBOT_SENDER_ID = process.env.MESSAGEBOT_SENDER_ID || "SIPZY"

  // In development mode, just log the OTP
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV MODE] SMS to ${phone}: ${message}`)
    return { success: true }
  }

  if (!MESSAGEBOT_API_KEY || MESSAGEBOT_API_KEY === "your_messagebot_api_key_here") {
    console.error("MESSAGEBOT_API_KEY not configured")
    return { success: false, error: "SMS service not configured" }
  }

  try {
    const cleanPhone = phone;
    
    const response = await fetch(MESSAGEBOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MESSAGEBOT_API_KEY}`,
        "API-Key": MESSAGEBOT_API_KEY
      },
      body: JSON.stringify({
        to: cleanPhone,
        sender: MESSAGEBOT_SENDER_ID,
        message: message
      })
    })

    const result = await response.json()
    
    if (response.ok && (result.success || result.status === "success" || result.message_id)) {
      return { success: true }
    }

    console.error("MessageBot API error:", result)
    return { success: false, error: result.message || "Failed to send SMS" }
  } catch (error) {
    console.error("SMS send error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * POST /auth/sms-hook
 * Supabase Custom SMS Hook endpoint
 * Receives: { user: { phone }, sms: { otp } }
 */
router.post("/auth/sms-hook", async (req, res) => {
  try {
    // Verify signature from Supabase (optional but recommended)
    const signature = req.headers["x-supabase-signature"]
    const hookSecret = process.env.SUPABASE_SMS_HOOK_SECRET
    
    if (hookSecret && signature) {
      const isValid = verifySupabaseSignature(req.body, signature, hookSecret)
      if (!isValid) {
        console.error("Invalid webhook signature")
        return res.status(401).json({ error: "Invalid signature" })
      }
    }

    const { user, sms } = req.body
    
    if (!user?.phone || !sms?.otp) {
      console.error("Invalid hook payload:", req.body)
      return res.status(400).json({ error: "Invalid payload" })
    }

    const phone = user.phone
    const otp = sms.otp
    const message = `Your SipZy verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`

    // Store OTP for dev mode retrieval
    otpStore.set(phone, { otp, timestamp: Date.now() })
    console.log(`[DEV] Stored OTP for ${phone}: ${otp}`)

    console.log(`Sending OTP to ${phone}`)
    
    const result = await sendSmsViaMessageBot(phone, message)
    
    if (!result.success) {
      console.error("Failed to send SMS:", result.error)
      // Return 200 anyway to prevent Supabase from retrying
      // The user will just not receive the OTP
    }

    // Supabase expects a 200 response
    res.json({ success: true })
  } catch (error) {
    console.error("SMS Hook error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

/**
 * GET /auth/dev-otp/:phone
 * Development endpoint to retrieve OTP for testing
 * Only works in development mode
 */
router.get("/auth/dev-otp/:phone", (req, res) => {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Not available in production" })
  }

  // Decode URL-encoded phone number (e.g., %2B91... -> +91...)
  const phone = decodeURIComponent(req.params.phone)
  console.log(`[DEV] Looking up OTP for phone: ${phone}`)
  
  const data = otpStore.get(phone)

  if (!data) {
    console.log(`[DEV] No OTP found. Available phones:`, Array.from(otpStore.keys()))
    return res.status(404).json({ error: "No OTP found for this phone" })
  }

  // Check if OTP is still valid (5 minutes)
  if (Date.now() - data.timestamp > 5 * 60 * 1000) {
    otpStore.delete(phone)
    return res.status(410).json({ error: "OTP expired" })
  }

  res.json({ otp: data.otp })
})

// ---- routing ----

// beverages
router.use(
  ["/restaurants/:restaurantId/beverages", "/beverages"],
  authenticate,
  beverageService
)

// events
router.use(
  ["/restaurants/:restaurantId/events", "/events"],
  authenticate,
  eventService
)

// restaurant core + documents + bank
router.use("/restaurants", authenticate, restaurantService)

export default router
