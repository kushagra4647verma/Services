export async function assertRestaurantOwner(req, restaurantId) {
  const userId = req.user.sub

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("ownerid")
    .eq("id", restaurantId)
    .single()

  if (error || !restaurant) {
    const err = new Error("Restaurant not found")
    err.statusCode = 404
    throw err
  }

  if (restaurant.ownerid !== userId) {
    const err = new Error("Forbidden")
    err.statusCode = 403
    throw err
  }
}
