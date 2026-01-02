import * as repo from "../repositories/expertRepository.js"

export async function fetchAssignedRestaurants(expertId) {
  return repo.getTasks(expertId)
}

export async function rateBeverage(expertId, beverageId, ratings) {
  await repo.upsertExpertRating(expertId, beverageId, ratings)
  await repo.recalculateExpertAggregate(beverageId)
  return { message: "Expert rating saved" }
}
