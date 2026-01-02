export function expertOrAdminOnly(req, res, next) {
  const role = req.headers["x-user-role"]

  if (role !== "expert" && role !== "admin") {
    return res.status(403).json({ error: "Forbidden" })
  }

  next()
}
