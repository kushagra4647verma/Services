import { supabase } from "./supabaseClient"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined")
}

export async function apiFetch(path, options = {}) {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) throw new Error("Not authenticated")

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`
    }
  })

  // ❗ Handle HTTP errors explicitly
  if (!res.ok) {
    let errorBody
    try {
      errorBody = await res.json()
    } catch {
      errorBody = { message: res.statusText }
    }
    throw errorBody
  }

  // ❗ Parse JSON before returning
  return res.json()
}

