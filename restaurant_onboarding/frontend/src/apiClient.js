import { supabase } from "./supabaseClient"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined")
}

export async function apiFetch(path, options = {}) {
  const {
    data: { session }
  } = await supabase.auth.getSession()
  // console.log("Uploading as:", session?.user?.id)
  // console.log("SESSION:", session)
  if (!session) throw new Error("Not authenticated")

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json"
    }
  })
}
