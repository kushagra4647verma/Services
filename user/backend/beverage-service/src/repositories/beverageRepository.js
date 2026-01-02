import { supabase } from "../db.js"

export async function getBeverageById(beverageId) {
  const { data, error } = await supabase
    .from("beverages")
    .select("*")
    .eq("beverageId", beverageId)
    .single()

  if (error) return null
  return data
}

export async function getAggregatedRatings(beverageId) {
  const { data, error } = await supabase
    .from("beverageRatings")
    .select("*")
    .eq("beverageId", beverageId)
    .single()

  if (error) return {
    avgHuman: 0,
    countHuman: 0,
    avgExpert: 0,
    countExpert: 0
  }

  return {
    avgHuman: data.countHuman
      ? data.sumRatingsHuman / data.countHuman
      : 0,
    countHuman: data.countHuman,
    avgExpert: data.countExpert
      ? data.sumRatingsExpert / data.countExpert
      : 0,
    countExpert: data.countExpert
  }
}

export async function upsertUserRating(
  userId,
  beverageId,
  rating,
  comments
) {
  const { error } = await supabase
    .from("userRatings")
    .upsert({
      userId,
      beverageId,
      rating,
      comments
    })

  if (error) throw error
}

export async function recalculateAggregates(beverageId) {
  const { data, error } = await supabase
    .from("userRatings")
    .select("rating")
    .eq("beverageId", beverageId)

  if (error) throw error

  const sum = data.reduce((a, b) => a + b.rating, 0)
  const count = data.length

  await supabase
    .from("beverageRatings")
    .upsert({
      beverageId,
      sumRatingsHuman: sum,
      countHuman: count
    })
}
