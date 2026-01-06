import { apiFetch } from "../apiClient"

export const getEvents = restaurantId =>
  apiFetch(`/restaurants/${restaurantId}/events`)

export const getEvent = eventId =>
  apiFetch(`/events/${eventId}`)
