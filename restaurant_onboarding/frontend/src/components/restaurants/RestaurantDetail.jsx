import BeverageList from "../beverages/BeverageList"
import EventList from "../events/EventList"
import UploadedFiles from "../common/UploadedFiles"
import { updateRestaurant } from "../../api/restaurants"

export default function RestaurantDetail({
  restaurant,
  onRestaurantUpdated
}) {
  async function handleFilesUpdated(newFiles) {
    const updated = await updateRestaurant(restaurant.id, {
      foodMenuPics: newFiles
    })

    onRestaurantUpdated(updated)
  }
  return (
    <>
      {console.log("Restaurant detail:", restaurant)}
      <h2>{restaurant.name}</h2>
      <BeverageList restaurantId={restaurant.id} />
      <EventList restaurantId={restaurant.id} />

      <div style={{ marginTop: "20px" }}>
      <h2>{restaurant.name}</h2>
      <p>{restaurant.bio}</p>

      {/* 🔥 SHOW FILES */}
      <UploadedFiles
        files={restaurant.foodMenuPics || []}
        restaurantId={restaurant.id}
        onFilesUpdated={handleFilesUpdated}
      />
    </div>
    </>
  )
}
