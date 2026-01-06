import { apiFetch } from "../apiClient"

export const getBeverages = restaurantId =>
  apiFetch(`/restaurants/${restaurantId}/beverages`)

export const getBeverage = beverageId =>
  apiFetch(`/beverages/${beverageId}`)
