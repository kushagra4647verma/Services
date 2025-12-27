import { supabase } from "./supabaseClient"

export async function apiFetch(url, options = {}) {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    }
  })
}
