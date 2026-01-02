import * as service from "../services/expertService.js"

export async function getAssignedRestaurants(req, res) {
  const requester = req.headers["x-user-id"]
  const role = req.headers["x-user-role"]
  const { expertId } = req.params

  if (role === "expert" && requester !== expertId) {
    return res.status(403).json({ error: "Forbidden" })
  }

  const data = await service.fetchAssignedRestaurants(expertId)
  res.json({ success: true, data })
}

export async function rateBeverage(req, res) {
  const expertId = req.headers["x-user-id"]
  const data = await service.rateBeverage(expertId, req.params.beverageId, req.body)
  res.json({ success: true, data })
}
