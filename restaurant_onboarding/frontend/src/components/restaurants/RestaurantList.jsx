export default function RestaurantList({ restaurants, onSelect }) {
  return (
    <>
      {restaurants.map(r => (
        <div key={r.id} onClick={() => onSelect(r)}>
          {r.name}
        </div>
      ))}
    </>
  )
}
