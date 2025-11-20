'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from './Button'
import Image from 'next/image'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  storeId?: string
  disabled?: boolean
}

interface UploadingFile {
  file: File
  preview: string
  progress: number
  error?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  storeId = '000000000000000000000001', // Demo store ID
  disabled = false,
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || disabled) return

      const fileArray = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      )

      if (value.length + fileArray.length > maxImages) {
        alert(`Vous ne pouvez uploader que ${maxImages} images maximum`)
        return
      }

      // Create preview URLs and uploading state
      const newUploadingFiles: UploadingFile[] = fileArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }))

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

      // Upload each file
      for (let i = 0; i < newUploadingFiles.length; i++) {
        const uploadingFile = newUploadingFiles[i]

        try {
          // Create FormData for upload
          const formData = new FormData()
          formData.append('file', uploadingFile.file)
          formData.append('storeId', storeId)
          formData.append('optimize', 'true')

          // Upload to our API with optimization
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.error || 'Upload failed')
          }

          const result = await uploadResponse.json()

          // Update progress
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file ? { ...f, progress: 100 } : f
            )
          )

          // Use the original optimized image URL
          const imageUrl = result.original?.url || result.url
          onChange([...value, imageUrl])

          // Remove from uploading after a short delay
          setTimeout(() => {
            setUploadingFiles((prev) =>
              prev.filter((f) => f.file !== uploadingFile.file)
            )
            URL.revokeObjectURL(uploadingFile.preview)
          }, 500)
        } catch (error: any) {
          console.error('Upload error:', error)
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === uploadingFile.file
                ? { ...f, error: error.message || 'Échec de l\'upload' }
                : f
            )
          )
        }
      }
    },
    [value, onChange, maxImages, storeId, disabled]
  )

  const handleRemove = (url: string) => {
    if (disabled) return
    onChange(value.filter((v) => v !== url))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const canAddMore = value.length + uploadingFiles.length < maxImages

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {canAddMore && (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8
            transition-all cursor-pointer
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isDragging ? 'bg-primary-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-6 h-6 ${
                isDragging ? 'text-primary-600' : 'text-gray-600'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Cliquez pour uploader ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à 10MB ({value.length}/{maxImages})
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Uploaded Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(url)}
                  disabled={disabled}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image
                src={uploadingFile.preview}
                alt={`Uploading ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 200px"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                {uploadingFile.error ? (
                  <div className="text-center px-2">
                    <X className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <p className="text-xs text-white">{uploadingFile.error}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-1" />
                    <p className="text-xs text-white">{uploadingFile.progress}%</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && uploadingFiles.length === 0 && (
        <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Aucune image uploadée</p>
        </div>
      )}
    </div>
  )
}
