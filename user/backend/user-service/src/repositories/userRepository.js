import { supabase } from "../db.js"

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("userId, name, phone")
    .eq("userId", userId)
    .single()

  if (error) throw error
  return data
}

export async function getUserBadges(userId) {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .eq("userId", userId)
    .single()

  if (error) return {}
  return data
}

export async function insertBookmark(userId, restaurantId) {
  const { error } = await supabase
    .from("bookmarks")
    .insert({ userId, restaurantId })

  if (error) throw error
}

export async function deleteBookmark(userId, restaurantId) {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("userId", userId)
    .eq("restaurantId", restaurantId)

  if (error) throw error
}

export async function getBookmarks(userId) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      restaurantId,
      restaurants (*)
    `)
    .eq("userId", userId)

  if (error) throw error
  return data.map(b => b.restaurants)
}

export async function recalculateBookmarkCount(userId) {
  const { count } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)

  await supabase
    .from("badges")
    .upsert({
      userId,
      bookmarkCount: count
    })
}

export async function insertDiary(userId, payload) {
  const { data, error } = await supabase
    .from("diary")
    .insert({ userId, ...payload })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDiary(userId) {
  const { data, error } = await supabase
    .from("diary")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })

  if (error) throw error
  return data
}

export async function updateDiary(userId, entryId, payload) {
  const { data, error } = await supabase
    .from("diary")
    .update(payload)
    .eq("entryId", entryId)
    .eq("userId", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDiary(userId, entryId) {
  const { error } = await supabase
    .from("diary")
    .delete()
    .eq("entryId", entryId)
    .eq("userId", userId)

  if (error) throw error
  return { message: "Diary entry deleted" }
}
