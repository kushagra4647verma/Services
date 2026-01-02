import * as service from "../services/restaurantService.js"

export async function getRestaurant(req, res) {
  const data = await service.getRestaurant(req.params.restaurantId)
  res.json({ success: true, data })
}

export async function getRestaurantBeverages(req, res) {
  const data = await service.getBeverages(req.params.restaurantId)
  res.json({ success: true, data })
}
