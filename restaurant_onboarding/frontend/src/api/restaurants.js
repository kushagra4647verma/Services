import { apiFetch } from "../apiClient"

export const getMyRestaurants = () =>
  apiFetch("/restaurants/me").then(r => r.json())

export const createRestaurant = data =>
  apiFetch("/restaurants", {
    method: "POST",
    body: JSON.stringify(data)
  }).then(r => r.json())

export const updateRestaurant = (id, data) =>
  apiFetch(`/restaurants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  }).then(r => r.json())
