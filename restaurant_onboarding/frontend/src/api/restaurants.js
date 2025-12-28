import { apiFetch } from "../apiClient"

export const getMyRestaurants = () =>
  apiFetch("/restaurants/me").then(r => r.json())

export const createRestaurant = data =>
  apiFetch("/restaurants", {
    method: "POST",
    body: JSON.stringify(data)
  }).then(r => r.json())

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