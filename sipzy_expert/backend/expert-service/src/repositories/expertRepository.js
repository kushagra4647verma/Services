import { supabase } from "../db.js"

export async function getTasks(expertId) {
  const { data } = await supabase
    .from("tasks")
    .select(`restaurantId, restaurants (*)`)
    .eq("expertId", expertId)

  return data.map(t => t.restaurants)
}

export async function upsertExpertRating(expertId, beverageId, r) {
  await supabase.from("expertRating").upsert({
    expertId,
    beverageId,
    ...r
  })
}

export async function recalculateExpertAggregate(beverageId) {
  const { data } = await supabase
    .from("expertRating")
    .select("presentationRating, tasteRating, ingredientsRating, accuracyRating")
    .eq("beverageId", beverageId)

  const count = data.length
  const sum = data.reduce(
    (a, b) => a + b.presentationRating + b.tasteRating + b.ingredientsRating + b.accuracyRating,
    0
  )

  await supabase.from("beverageRatings").upsert({
    beverageId,
    sumRatingsExpert: sum,
    countExpert: count
  })
}
