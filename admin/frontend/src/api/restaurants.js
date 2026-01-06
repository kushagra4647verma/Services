import { apiFetch } from "../apiClient"

// Get all restaurants (admin view - no user filter)
export const getAllRestaurants = () =>
  apiFetch("/restaurants")

// Get single restaurant
export const getRestaurant = (id) =>
  apiFetch(`/restaurants/${id}`)

// Get legal info
export function getLegalInfo(restaurantId) {
  return apiFetch(`/restaurants/${restaurantId}/legal`)
}

// Get bank details
export function getBankDetails(restaurantId) {
  return apiFetch(`/restaurants/${restaurantId}/bank`)
}

// Update restaurant verification status
export function updateVerificationStatus(restaurantId, isVerified) {
  return apiFetch(`/restaurants/${restaurantId}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ isVerified })
  })
}
