import express from "express"
import proxy from "express-http-proxy"
import crypto from "crypto"
import { authenticate } from "./authMiddleware.js"

const router = express.Router()

// ---- service proxies (DNS name = docker-compose service key) ----
const restaurantService = proxy("http://restaurant-service:4001", {
  proxyReqPathResolver: req => req.originalUrl
})

const beverageService = proxy("http://beverage-service:4002", {
  proxyReqPathResolver: req => req.originalUrl
})

const eventService = proxy("http://event-service:4003", {
  proxyReqPathResolver: req => req.originalUrl
})

// ---- SMS Hook for Supabase Custom SMS ----

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
    const cleanPhone = phone.replace("+", "")
    
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
