import { apiFetch } from "../apiClient"

export const getEvents = restaurantId =>
  apiFetch(`/restaurants/${restaurantId}/events`).then(r => r.json())

export const createEvent = (restaurantId, data) =>
  apiFetch(`/restaurants/${restaurantId}/events`, {
    method: "POST",
    body: JSON.stringify(data)
  }).then(r => r.json())

export const deleteEvent = id =>
  apiFetch(`/events/${id}`, { method: "DELETE" })
