import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkRestaurants() {
  console.log("Checking restaurants in database...")
  
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, ownerId, name")
    .limit(20)
  
  if (error) {
    console.error("Error:", error)
    return
  }
  
  console.log("\nFound", data.length, "restaurants:")
  console.log("---")
  data.forEach(r => {
    console.log(`Name: ${r.name}`)
    console.log(`Owner ID: ${r.ownerId}`)
    console.log(`Restaurant ID: ${r.id}`)
    console.log("---")
  })
  
  // Get unique owner IDs
  const ownerIds = [...new Set(data.map(r => r.ownerId))]
  console.log("\nUnique Owner IDs in database:")
  ownerIds.forEach(id => console.log(`  - ${id}`))
  
  console.log("\nYour current user ID: 0d7da8b9-f59e-4321-844e-f3ad58cad79f")
  console.log("Match:", ownerIds.includes("0d7da8b9-f59e-4321-844e-f3ad58cad79f") ? "YES" : "NO")
}

checkRestaurants()
