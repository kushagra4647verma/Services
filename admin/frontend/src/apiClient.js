const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined")
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...options.headers
    }
  })

  if (!res.ok) {
    let errorBody
    try {
      errorBody = await res.json()
    } catch {
      errorBody = { message: res.statusText }
    }
    throw errorBody
  }

  const contentLength = res.headers.get("content-length")
  const contentType = res.headers.get("content-type")
  
  if (res.status === 204 || contentLength === "0" || !contentType?.includes("application/json")) {
    return null
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}
