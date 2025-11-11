'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './Button'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return

      setIsUploading(true)

      try {
        // Upload to Cloudinary or your preferred service
        const uploadedUrls: string[] = []

        for (const file of acceptedFiles) {
          // For demo purposes, we'll use a base64 data URL
          // In production, replace this with actual upload to Cloudinary/S3
          const reader = new FileReader()
          await new Promise((resolve) => {
            reader.onload = () => {
              const dataUrl = reader.result as string
              // In production, upload to Cloudinary here and get the URL
              // For now, using Unsplash placeholder
              const placeholderUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=400&fit=crop`
              uploadedUrls.push(placeholderUrl)
              resolve(null)
            }
            reader.readAsDataURL(file)
          })
        }

        onChange([...value, ...uploadedUrls].slice(0, maxImages))
      } catch (error) {
        console.error('Upload failed:', error)
      } finally {
        setIsUploading(false)
      }
    },
    [value, onChange, maxImages, disabled]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: maxImages - value.length,
    disabled: disabled || value.length >= maxImages,
  })

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
            >
              <Image src={url} alt={`Upload ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  {isDragActive ? (
                    <Upload className="w-6 h-6 text-primary-600" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive
                      ? 'Déposez les images ici'
                      : 'Glissez-déposez ou cliquez pour sélectionner'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF jusqu'à 10MB ({value.length}/{maxImages} images)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
