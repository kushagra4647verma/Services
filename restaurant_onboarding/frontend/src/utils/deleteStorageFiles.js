import { supabase } from "../supabaseClient"

export async function deleteStorageFile(fileUrl) {
  const url = new URL(fileUrl)

  const prefix = "/storage/v1/object/public/test2/"
  if (!url.pathname.startsWith(prefix)) {
    throw new Error("Invalid storage URL")
  }

  const path = url.pathname.replace(prefix, "")

  const { error } = await supabase.storage
    .from("test2")
    .remove([path])

  if (error) {
    throw error
  }
}
