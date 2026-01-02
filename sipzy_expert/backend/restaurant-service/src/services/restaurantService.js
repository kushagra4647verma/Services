import * as repo from "../repositories/restaurantRepository.js"

export const getRestaurant = id => repo.fetchRestaurant(id)
export const getBeverages = id => repo.fetchBeverages(id)
