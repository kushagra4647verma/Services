import { supabase } from "../db.js"

export async function getUpcomingEvents() {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("restaurantEvents")
    .select("*")
    .gte("date", today)
    .order("eventDate", { ascending: true })

  if (error) throw error
  return data
}

export async function getEventById(eventId) {
  const { data, error } = await supabase
    .from("restaurantEvents")
    .select("*")
    .eq("id", eventId)
    .single()

  if (error) return null
  return data
}
