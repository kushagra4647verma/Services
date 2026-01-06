import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    console.log("restaurant-service auth: No auth header")
    return res.sendStatus(401)
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    console.log("restaurant-service auth: No token in header")
    return res.sendStatus(401)
  }

  try {
    // Supabase JWT is already verified upstream
    const payload = jwt.decode(token)
    console.log("restaurant-service auth: User ID:", payload?.sub)

    req.user = payload
    next()
  } catch (err) {
    console.error("restaurant-service auth: Error:", err)
    res.sendStatus(401)
  }
}