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

/**
 * Delete entire restaurant folder from storage
 * @param {string} restaurantId - The restaurant ID
 */
export async function deleteRestaurantFolder(restaurantId) {
  if (!restaurantId) return

  const folderPath = `restaurants/${restaurantId}`
  
  try {
    // List all files in the restaurant's folder
    const { data: files, error: listError } = await supabase.storage
      .from("test2")
      .list(folderPath)

    if (listError) {
      console.error("Failed to list files in folder:", listError)
      return
    }

    if (!files || files.length === 0) {
      console.log("No files found in restaurant folder:", folderPath)
      return
    }

    // Build full paths for all files
    const filePaths = files.map(file => `${folderPath}/${file.name}`)
    
    console.log("Deleting restaurant folder files:", filePaths)

    // Delete all files in the folder
    const { error: deleteError } = await supabase.storage
      .from("test2")
      .remove(filePaths)

    if (deleteError) {
      console.error("Failed to delete restaurant folder:", deleteError)
      throw deleteError
    }

    console.log("Successfully deleted restaurant folder:", folderPath)
  } catch (err) {
    console.error("Error deleting restaurant folder:", err)
    // Don't throw - we don't want to block restaurant deletion if storage cleanup fails
  }
}
