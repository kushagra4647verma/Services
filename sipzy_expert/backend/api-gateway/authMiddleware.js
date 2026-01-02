import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" })
  }

  try {
    const token = auth.split(" ")[1]
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET)

    req.user = {
      userId: decoded.sub,
      user_role: decoded.user_role
    }

    next()
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }
}

export function requireExpertOrAdmin(req, res, next) {
  const role = req.user?.user_role
  if (role !== "expert" && role !== "admin") {
    return res.status(403).json({ error: "Forbidden" })
  }
  next()
}
