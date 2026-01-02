import { supabase } from "../db.js"

export async function insertFriend(userId, friendId) {
  const { error } = await supabase
    .from("friends")
    .upsert({ userId, friendId })

  if (error) throw error
}

export async function deleteFriend(userId, friendId) {
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("userId", userId)
    .eq("friendId", friendId)

  if (error) throw error
}

export async function getFriends(userId) {
  const { data, error } = await supabase
    .from("friends")
    .select(`
      friendId,
      users:userId!friends_friendId_fkey (
        userId,
        name,
        phone
      )
    `)
    .eq("userId", userId)

  if (error) throw error
  return data.map(f => f.users)
}

export async function recalculateFriendCount(userId) {
  const { count } = await supabase
    .from("friends")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)

  await supabase
    .from("badges")
    .upsert({
      userId,
      friendsCount: count
    })
}
