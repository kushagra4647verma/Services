import jwt from "jsonwebtoken"

export function authenticate(req, res, next) {
  // console.log("request in authenticate():", req);     //testing
  const token = req.headers.authorization?.split(" ")[1]
  // console.log("Token in authenticate():", token);  //testing
  if (!token) return res.sendStatus(401)

  try {
    const payload = jwt.decode(token)
    // console.log("payload:", payload);
    req.user = payload
    next()
  } catch {
    res.sendStatus(401)
  }
}
