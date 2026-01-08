import { deleteStorageFile } from "../../utils/deleteStorageFiles"
import { uploadRestaurantFiles } from "../../utils/uploadRestaurantFiles"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, FileText, ExternalLink } from "lucide-react"

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
    return (
      <div className="glass rounded-xl p-6 text-center">
        <FileText className="w-10 h-10 text-white/20 mx-auto mb-2" />
        <p className="text-white/60 text-sm">No documents uploaded yet</p>
      </div>
    )
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
    <div className="space-y-3">
      <h4 className="text-white font-semibold flex items-center gap-2">
        <FileText className="w-4 h-4 text-amber-500" />
        Uploaded Files ({files.length})
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {files.map((url, idx) => (
          <div
            key={idx}
            className="glass rounded-xl overflow-hidden group hover:scale-[1.02] transition-all duration-200"
          >
            {/* Preview */}
            {isImage(url) ? (
              <div className="relative h-32">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-amber-500/10 to-purple-500/10 flex flex-col items-center justify-center p-3">
                <FileText className="w-10 h-10 text-white/30 mb-2" />
                <p className="text-white/60 text-xs text-center truncate w-full px-2">
                  {getFileName(url)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="p-2 space-y-2">
              {/* File name for images */}
              {isImage(url) && (
                <p className="text-white/80 text-xs truncate">{getFileName(url)}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => handleDelete(url)}
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 glass border-white/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <label>
                  <Button
                    asChild
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 glass border-white/20 text-white hover:bg-amber-500/20 hover:border-amber-500/50 cursor-pointer"
                    title="Replace"
                  >
                    <span>
                      <RefreshCw className="w-4 h-4" />
                    </span>
                  </Button>
                  <input
                    type="file"
                    hidden
                    onChange={e => {
                      if (e.target.files[0]) {
                        handleReplace(url, e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>

              {/* Open in new tab */}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-amber-500/80 hover:text-amber-500 text-xs transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Open
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
