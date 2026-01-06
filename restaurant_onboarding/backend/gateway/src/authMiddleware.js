import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    console.log("authenticate: No token provided")
    return res.sendStatus(401)
  }

  try {
    const payload = jwt.decode(token)
    if (!payload) {
      console.log("authenticate: Failed to decode token")
      return res.sendStatus(401)
    }
    console.log("authenticate: User ID from token:", payload.sub)
    req.user = payload
    next()
  } catch (err) {
    console.error("authenticate: Error decoding token:", err)
    res.sendStatus(401)
  }
}
