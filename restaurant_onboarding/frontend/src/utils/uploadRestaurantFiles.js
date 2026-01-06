import { supabase } from "../supabaseClient"

/**
 * Upload up to N files for a restaurant
 * @param {string} restaurantId
 * @param {File[]} files
 * @returns {Promise<string[]>} public URLs
 */
export async function uploadRestaurantFiles(restaurantId, files) {
  if (!files || files.length === 0) return []

  if (files.length > 5) {
    throw new Error("Maximum 5 files allowed")
  }

  const uploadedUrls = []

  for (const file of files) {
    // console.log("Uploading:", file.name, file.type)

    const fileExt = file.name.split(".").pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const filePath = `restaurants/${restaurantId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("test2")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      throw uploadError
    }

    const { data } = supabase.storage
      .from("test2")
      .getPublicUrl(filePath)

    uploadedUrls.push(data.publicUrl)
  }

  return uploadedUrls
}
