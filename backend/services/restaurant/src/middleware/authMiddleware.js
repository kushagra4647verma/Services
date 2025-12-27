import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.sendStatus(401)

  const token = authHeader.split(" ")[1]
  if (!token) return res.sendStatus(401)

  try {
    // Supabase JWT is already verified upstream
    const payload = jwt.decode(token)

    req.user = payload
    next()
  } catch {
    res.sendStatus(401)
  }
}
