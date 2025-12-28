export default function RestaurantList({
  restaurants,
  onSelect,
  onDelete
}) {
  return (
    <>
      {restaurants.map(r => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ccc",
            padding: "8px",
            marginBottom: "6px",
            cursor: "pointer"
          }}
          onClick={() => onSelect(r)}
        >
          <span>{r.name}</span>

          {/* 🔥 Delete button */}
          <button
            style={{ marginLeft: "10px" }}
            onClick={e => {
              e.stopPropagation() // ⛔ prevent select
              onDelete(r.id)
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </>
  )
}
