'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from './Button'
import Image from 'next/image'

interface SingleImageUploadProps {
  value: string
  onChange: (url: string) => void
  storeId?: string
  disabled?: boolean
  label?: string
  aspectRatio?: 'square' | 'banner' | 'logo'
  placeholder?: string
}

export function SingleImageUpload({
  value = '',
  onChange,
  storeId = '',
  disabled = false,
  label,
  aspectRatio = 'square',
  placeholder = 'Cliquez pour uploader ou glissez-déposez',
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectClasses = {
    square: 'aspect-square',
    banner: 'aspect-[3/1]',
    logo: 'aspect-square max-w-[200px]',
  }

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return

      const file = files[0]
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image')
        return
      }

      setIsUploading(true)
      setError('')

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('storeId', storeId)
        formData.append('optimize', 'true')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        const imageUrl = result.original?.url || result.url
        onChange(imageUrl)
      } catch (err: any) {
        console.error('Upload error:', err)
        setError(err.message || 'Échec de l\'upload')
      } finally {
        setIsUploading(false)
      }
    },
    [storeId, disabled, onChange]
  )

  const handleRemove = () => {
    if (!disabled) {
      onChange('')
    }
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
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  if (value) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className={`relative ${aspectClasses[aspectRatio]} bg-gray-100 rounded-lg overflow-hidden group`}>
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative ${aspectClasses[aspectRatio]} border-2 border-dashed rounded-lg
          transition-all cursor-pointer flex items-center justify-center
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isUploading ? (
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Upload en cours...</p>
          </div>
        ) : (
          <div className="text-center p-4">
            <Upload className={`w-8 h-8 mx-auto mb-2 ${
              isDragging ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <p className="text-sm text-gray-600">{placeholder}</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 10MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
