import { apiFetch } from "../apiClient"

export const getBeverages = restaurantId =>
  apiFetch(`/restaurants/${restaurantId}/beverages`).then(r => r.json())

export const createBeverage = (restaurantId, data) =>
  apiFetch(`/restaurants/${restaurantId}/beverages`, {
    method: "POST",
    body: JSON.stringify(data)
  }).then(r => r.json())

export const deleteBeverage = id =>
  apiFetch(`/beverages/${id}`, { method: "DELETE" })

export const updateBeverage = (beverageId, data) =>
  apiFetch(`/beverages/${beverageId}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  }).then(r => r.json())
