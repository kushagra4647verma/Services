import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

export default function FileDropzone({ onFilesSelected, maxFiles = 5 }) {
  const onDrop = useCallback(
    acceptedFiles => {
      if (acceptedFiles.length > maxFiles) {
        alert(`You can upload up to ${maxFiles} files`)
        return
      }
      onFilesSelected(acceptedFiles)
    },
    [onFilesSelected, maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: maxFiles > 1
  })

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed gray",
        padding: "20px",
        textAlign: "center"
      }}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <p>Drop files here …</p>
      ) : (
        <p>Drag & drop files here, or click to select files</p>
      )}
    </div>
  )
}
