import { apiFetch } from "../apiClient"

export const getBeverages = restaurantId =>
  apiFetch(`/restaurants/${restaurantId}/beverages`)


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
