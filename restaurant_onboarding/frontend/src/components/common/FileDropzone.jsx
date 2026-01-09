import { useCallback, useState, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, Image, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FileDropzone({ onFilesSelected, maxFiles = 5, existingCount = 0, accept, files: externalFiles }) {
  const [files, setFiles] = useState(externalFiles || [])
  const prevExternalFilesRef = useRef(externalFiles)

  // Sync internal state with external files prop when it changes
  // Only update if externalFiles is provided and has actually changed
  useEffect(() => {
    if (externalFiles !== undefined && externalFiles !== prevExternalFilesRef.current) {
      prevExternalFilesRef.current = externalFiles
      setFiles(externalFiles)
    }
  }, [externalFiles])

  // Calculate how many more files can be added
  const remainingSlots = maxFiles - existingCount - files.length

  const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1MB for images

  const onDrop = useCallback(
    acceptedFiles => {
      // Check image file sizes (1MB limit for images, no limit for PDFs)
      const oversizedImages = acceptedFiles.filter(
        f => f.type.startsWith('image/') && f.size > MAX_IMAGE_SIZE
      )
      
      if (oversizedImages.length > 0) {
        const names = oversizedImages.map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)}MB)`).join('\n')
        alert(`The following images exceed 1MB size limit:\n\n${names}\n\nPlease compress or resize these images.`)
        // Filter out oversized images
        acceptedFiles = acceptedFiles.filter(
          f => !f.type.startsWith('image/') || f.size <= MAX_IMAGE_SIZE
        )
        if (acceptedFiles.length === 0) return
      }

      // Calculate remaining slots and check if selection exceeds limit
      const canAdd = maxFiles - existingCount - files.length
      
      if (acceptedFiles.length > canAdd) {
        if (canAdd <= 0) {
          alert(`Maximum ${maxFiles} files allowed. You already have ${existingCount + files.length} file(s).`)
        } else {
          alert(`You selected ${acceptedFiles.length} files but only ${canAdd} more can be added. Please select ${canAdd} or fewer files.`)
        }
        return
      }
      
      // Add preview URLs for images and accumulate with existing files
      const filesWithPreview = acceptedFiles.map(file => 
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        })
      )
      const newFiles = [...files, ...filesWithPreview]
      setFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [onFilesSelected, maxFiles, existingCount, files]
  )

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: maxFiles > 1,
    accept: accept,
    disabled: remainingSlots <= 0
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
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          remainingSlots <= 0 
            ? 'border-white/10 bg-white/5 cursor-not-allowed opacity-50'
            : isDragActive 
              ? 'border-amber-500 bg-amber-500/10 cursor-pointer' 
              : 'border-white/20 hover:border-white/40 hover:bg-white/5 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        
        <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? 'text-amber-500' : 'text-white/40'}`} />
        
        {remainingSlots <= 0 ? (
          <p className="text-white/40 font-medium">Maximum files reached</p>
        ) : isDragActive ? (
          <p className="text-amber-500 font-medium">Drop files here…</p>
        ) : (
          <>
            <p className="text-white/80 font-medium">Drag & drop files here</p>
            <p className="text-white/40 text-sm mt-1">or click to select files</p>
          </>
        )}
        
        <p className="text-white/30 text-xs mt-3">
          {existingCount > 0 
            ? `${existingCount + files.length} / ${maxFiles} files (${remainingSlots} remaining)`
            : `Max ${maxFiles} files`
          }
        </p>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-2 w-full overflow-hidden">
          <p className="text-white/60 text-sm">{files.length} file(s) selected</p>
          
          <div className="space-y-2 w-full">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="glass rounded-lg p-3 flex items-center gap-3 w-full overflow-hidden"
              >
                {/* Preview or Icon */}
                {file.preview ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-white text-sm font-medium truncate max-w-full">{file.name}</p>
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
