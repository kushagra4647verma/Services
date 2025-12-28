import { deleteStorageFile } from "../../utils/deleteStorageFiles"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"

function isImage(url) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
}

function getFileName(url) {
  return decodeURIComponent(url.split("/").pop())
}

export default function UploadedFiles({
  files = [],
  restaurantId,
  onFilesUpdated
}) {
  if (!files.length) {
    return <p>No documents uploaded.</p>
  }

  async function handleDelete(url) {
    const ok = window.confirm("Delete this file permanently?")
    if (!ok) return

    await deleteStorageFile(url)

    const updated = files.filter(f => f !== url)
    onFilesUpdated(updated)
  }

  async function handleReplace(oldUrl, newFile) {
    await deleteStorageFile(oldUrl)

    const [newUrl] = await uploadRestaurantFiles(
      restaurantId,
      [newFile]
    )

    const updated = files.map(f =>
      f === oldUrl ? newUrl : f
    )

    onFilesUpdated(updated)
  }

  return (
    <div style={{ marginTop: "12px" }}>
      <h4>Uploaded Files</h4>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {files.map((url, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              width: "180px"
            }}
          >
            {isImage(url) ? (
              <img
                src={url}
                alt=""
                style={{
                  width: "100%",
                  height: "120px",
                  objectFit: "cover"
                }}
              />
            ) : (
              <a href={url} target="_blank" rel="noreferrer">
                📄 {getFileName(url)}
              </a>
            )}

            <div style={{ marginTop: "6px" }}>
              <button onClick={() => handleDelete(url)}>
                Delete
              </button>

              <label style={{ marginLeft: "6px" }}>
                Replace
                <input
                  type="file"
                  hidden
                  onChange={e =>
                    handleReplace(url, e.target.files[0])
                  }
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
