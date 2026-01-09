import { supabase } from "../supabaseClient"

/**
 * Copy an image from one restaurant's storage to another
 * Downloads the image and re-uploads it to the target restaurant's folder
 * @param {string} sourceUrl - The public URL of the source image
 * @param {string} targetRestaurantId - The target restaurant ID
 * @returns {Promise<string|null>} - The new public URL or null if failed
 */
export async function copyImageToRestaurant(sourceUrl, targetRestaurantId) {
  if (!sourceUrl || !targetRestaurantId) return null

  try {
    // Extract the file path from the URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/test2/restaurants/{restaurantId}/{filename}
    const urlObj = new URL(sourceUrl)
    const pathParts = urlObj.pathname.split("/test2/")
    
    if (pathParts.length < 2) {
      console.error("Could not parse storage URL:", sourceUrl)
      return null
    }

    const sourcePath = decodeURIComponent(pathParts[1])
    
    // Download the file from source
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("test2")
      .download(sourcePath)

    if (downloadError) {
      console.error("Failed to download source file:", downloadError)
      return null
    }

    // Generate new filename with UUID
    const originalFileName = sourcePath.split("/").pop()
    const fileExt = originalFileName.split(".").pop()
    const newFileName = `${crypto.randomUUID()}.${fileExt}`
    const targetPath = `restaurants/${targetRestaurantId}/${newFileName}`

    // Upload to target location
    const { error: uploadError } = await supabase.storage
      .from("test2")
      .upload(targetPath, fileData, {
        contentType: fileData.type || "application/octet-stream",
        upsert: false
      })

    if (uploadError) {
      console.error("Failed to upload to target:", uploadError)
      return null
    }

    // Get the public URL of the new file
    const { data: publicUrlData } = supabase.storage
      .from("test2")
      .getPublicUrl(targetPath)

    return publicUrlData.publicUrl
  } catch (err) {
    console.error("Error copying storage file:", err)
    return null
  }
}
