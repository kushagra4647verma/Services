import { supabase } from "../db.js"

export async function deleteStorageFiles(fileUrls = []) {
  if (!fileUrls.length) return

  const paths = fileUrls
  
    .map(url => {
      try {
        const u = new URL(url)

        // pathname example:
        // /storage/v1/object/public/restaurant-docs/restaurants/<id>/<file>
        const pathname = u.pathname

        const prefix = "/storage/v1/object/public/test2/"
        if (!pathname.startsWith(prefix)) {
          console.warn("Unexpected storage URL:", url)
          return null
        }

        // ✅ extract path RELATIVE to bucket
        return pathname.replace(prefix, "")
      } catch {
        console.warn("Invalid URL:", url)
        return null
      }
    })
    .filter(Boolean)

  if (!paths.length) return

  console.log("Deleting storage files:", paths)

  const { error } = await supabase.storage
    .from("test2")
    .remove(paths)

  if (error) {
    console.error("Storage delete failed:", error)
    throw error
  }
}
