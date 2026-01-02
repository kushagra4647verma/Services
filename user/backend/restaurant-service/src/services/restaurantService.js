import * as repo from "../repositories/restaurantRepository.js"

export async function fetchAllVerifiedRestaurants() {
  return repo.getVerifiedRestaurants()
}

export async function fetchTrendingRestaurants() {
  return repo.getTrendingRestaurants()
}

export async function fetchRestaurantDetails(restaurantId) {
  const [restaurant, docs] = await Promise.all([
    repo.getRestaurantById(restaurantId)
    // repo.getRestaurantDocuments(restaurantId)
  ])

  if (!restaurant) {
    throw new Error("Restaurant not found")
  }

  return {
    ...restaurant,
    documents: docs
  }
}

export async function fetchRestaurantBeverages(restaurantId) {
  return repo.getRestaurantBeverages(restaurantId)
}
