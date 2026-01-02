import { supabase } from "../db.js"

export async function getUpcomingEvents() {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })

  if (error) throw error
  return data
}

export async function getEventById(eventId) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("eventId", eventId)
    .single()

  if (error) return null
  return data
}
