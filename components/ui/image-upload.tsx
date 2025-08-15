"use client"

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onImagesSelected: (images: File[]) => void
  maxImages?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({ 
  onImagesSelected, 
  maxImages = 4, 
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported'
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }
    return null
  }

  const processFiles = useCallback((files: FileList) => {
    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      const newImages = [...selectedImages, ...validFiles].slice(0, maxImages)
      setSelectedImages(newImages)
      
      // Create preview URLs
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file))
      setPreviewUrls(newPreviewUrls)
      
      onImagesSelected(newImages)
    }
  }, [selectedImages, maxImages, acceptedTypes, maxSize, onImagesSelected])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      processFiles(files)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = event.dataTransfer.files
    if (files) {
      processFiles(files)
    }
  }, [processFiles])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index)
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index])
    
    setSelectedImages(newImages)
    setPreviewUrls(newPreviewUrls)
    onImagesSelected(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {selectedImages.length < maxImages && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white pixelated-text mb-2">
                {isDragOver ? 'Drop images here' : 'Upload Images'}
              </h3>
              <p className="text-slate-400 pixelated-text text-sm">
                Drag and drop images here, or click to select
              </p>
              <p className="text-slate-500 pixelated-text text-xs mt-2">
                Max {maxImages} images, {maxSize}MB each
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedImages.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-800/50 border border-slate-600">
                <img
                  src={previewUrls[index]}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white text-xs truncate pixelated-text">
                  {file.name}
                </p>
                <p className="text-slate-300 text-xs pixelated-text">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <div className="flex-1">
              <div className="text-sm text-white pixelated-text mb-1">
                Uploading images...
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for handling image uploads
export function useImageUpload() {
  const [images, setImages] = useState<File[]>([])
  const [uploadUrls, setUploadUrls] = useState<string[]>([])

  const handleImagesSelected = (selectedImages: File[]) => {
    setImages(selectedImages)
  }

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []

    const urls: string[] = []
    
    for (const image of images) {
      try {
        // Convert to base64 for demo (in real app, upload to cloud storage)
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(image)
        })
        urls.push(base64)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    setUploadUrls(urls)
    return urls
  }

  const clearImages = () => {
    setImages([])
    setUploadUrls([])
  }

  return {
    images,
    uploadUrls,
    handleImagesSelected,
    uploadImages,
    clearImages
  }
}
