import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.sendStatus(401)

  const token = authHeader.split(" ")[1]
  if (!token) return res.sendStatus(401)

  const payload = jwt.decode(token)
  if (!payload?.sub) return res.sendStatus(401)

  req.user = payload
  next()
}

//we can avoid this i think