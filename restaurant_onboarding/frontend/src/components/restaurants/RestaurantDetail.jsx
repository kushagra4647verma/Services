import BeverageList from "../beverages/BeverageList"
import EventList from "../events/EventList"

export default function RestaurantDetail({ restaurant }) {
  return (
    <>
      <h2>{restaurant.name}</h2>
      <BeverageList restaurantId={restaurant.id} />
      <EventList restaurantId={restaurant.id} />
    </>
  )
}
