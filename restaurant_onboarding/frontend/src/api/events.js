import { apiFetch } from "../apiClient"

export const getEvents = restaurantId =>
  apiFetch(`/restaurants/${restaurantId}/events`)

export const createEvent = (restaurantId, data) =>
  apiFetch(`/restaurants/${restaurantId}/events`, {
    method: "POST",
    body: JSON.stringify(data)
  })

export const updateEvent = (id, data) =>
  apiFetch(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })

export const deleteEvent = id =>
  apiFetch(`/events/${id}`, { method: "DELETE" })
