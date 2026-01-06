import { supabase } from "./supabaseClient"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined")
}

export async function apiFetch(path, options = {}) {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    console.error("apiFetch: No session found")
    throw new Error("Not authenticated")
  }

  // Debug: Log user ID being used
  console.log("apiFetch: Making request as user:", session.user.id)

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
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

  // ❗ Handle empty responses (like 204 No Content from DELETE)
  const contentLength = res.headers.get("content-length")
  const contentType = res.headers.get("content-type")
  
  if (res.status === 204 || contentLength === "0" || !contentType?.includes("application/json")) {
    return null
  }

  // ❗ Parse JSON before returning
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

