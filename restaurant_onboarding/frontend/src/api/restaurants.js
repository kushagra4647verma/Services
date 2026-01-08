import { apiFetch } from "../apiClient"

export const getMyRestaurants = () =>
  apiFetch("/restaurants/me")

export const getRestaurant = (restaurantId) =>
  apiFetch(`/restaurants/${restaurantId}`)

export const createRestaurant = data =>
  apiFetch("/restaurants", {
    method: "POST",
    body: JSON.stringify(data)
  })

export async function updateRestaurant(id, payload) {
  const res = await apiFetch(`/restaurants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  })

  return res // MUST be updated restaurant
}

export function deleteRestaurant(restaurantId) {
  return apiFetch(`/restaurants/${restaurantId}`, {
    method: "DELETE"
  })
}

// Legal Info
export function getLegalInfo(restaurantId) {
  return apiFetch(`/restaurants/${restaurantId}/legal`)
}

export function updateLegalInfo(restaurantId, data) {
  return apiFetch(`/restaurants/${restaurantId}/legal`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}

// Bank Details
export function getBankDetails(restaurantId) {
  return apiFetch(`/restaurants/${restaurantId}/bank`)
}

export function updateBankDetails(restaurantId, data) {
  return apiFetch(`/restaurants/${restaurantId}/bank`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}