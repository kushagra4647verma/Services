import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, Image, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FileDropzone({ onFilesSelected, maxFiles = 5 }) {
  const [files, setFiles] = useState([])

  const onDrop = useCallback(
    acceptedFiles => {
      if (acceptedFiles.length > maxFiles) {
        alert(`You can upload up to ${maxFiles} files`)
        return
      }
      // Add preview URLs for images
      const filesWithPreview = acceptedFiles.map(file => 
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        })
      )
      setFiles(filesWithPreview)
      onFilesSelected(acceptedFiles)
    },
    [onFilesSelected, maxFiles]
  )

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: maxFiles > 1
  })

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-amber-500" />
    }
    if (file.type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />
    }
    return <File className="w-5 h-5 text-white/60" />
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-amber-500 bg-amber-500/10' 
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        }`}
      >
        <input {...getInputProps()} />
        
        <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? 'text-amber-500' : 'text-white/40'}`} />
        
        {isDragActive ? (
          <p className="text-amber-500 font-medium">Drop files here…</p>
        ) : (
          <>
            <p className="text-white/80 font-medium">Drag & drop files here</p>
            <p className="text-white/40 text-sm mt-1">or click to select files</p>
          </>
        )}
        
        <p className="text-white/30 text-xs mt-3">Max {maxFiles} files</p>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/60 text-sm">{files.length} file(s) selected</p>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="glass rounded-lg p-3 flex items-center gap-3"
              >
                {/* Preview or Icon */}
                {file.preview ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-white/40 text-xs">{formatFileSize(file.size)}</p>
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="h-8 w-8 text-white/40 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
