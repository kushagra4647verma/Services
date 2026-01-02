import * as repo from "../repositories/beverageRepository.js"

export async function fetchBeverageDetails(beverageId) {
  const [beverage, ratings] = await Promise.all([
    repo.getBeverageById(beverageId),
    repo.getAggregatedRatings(beverageId)
  ])

  if (!beverage) {
    throw new Error("Beverage not found")
  }

  return {
    ...beverage,
    ratings
  }
}

export async function fetchBeverageRatings(beverageId) {
  return repo.getAggregatedRatings(beverageId)
}

export async function createOrUpdateRating(
  userId,
  beverageId,
  rating,
  comments
) {
  if (!userId) throw new Error("Unauthorized")
  if (rating < 1 || rating > 5) throw new Error("Invalid rating")

  // Upsert user rating
  await repo.upsertUserRating(userId, beverageId, rating, comments)

  // Recalculate aggregates (correct-by-design)
  await repo.recalculateAggregates(beverageId)

  return { message: "Rating saved" }
}
