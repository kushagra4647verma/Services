import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.sendStatus(401)

  try {
    const payload = jwt.decode(token)
    req.user = payload
    next()
  } catch {
    res.sendStatus(401)
  }
}
