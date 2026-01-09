import { apiFetch } from "../apiClient"

export const getBeverages = restaurantId =>
  apiFetch(`/restaurants/${restaurantId}/beverages`)

export const getAllUserBeverages = () =>
  apiFetch("/beverages/user/all")

export const copyBeveragesFromRestaurant = (targetRestaurantId, sourceRestaurantId) =>
  apiFetch(`/restaurants/${targetRestaurantId}/beverages/copy-from/${sourceRestaurantId}`, {
    method: "POST"
  })

export const createBeverage = (restaurantId, data) =>
  apiFetch(`/restaurants/${restaurantId}/beverages`, {
    method: "POST",
    body: JSON.stringify(data)
  })

export const deleteBeverage = id =>
  apiFetch(`/beverages/${id}`, { method: "DELETE" })

export const updateBeverage = (beverageId, data) =>
  apiFetch(`/beverages/${beverageId}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
