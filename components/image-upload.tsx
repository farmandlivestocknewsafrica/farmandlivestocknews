'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, ImageIcon, Loader2, FileText } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { ALLOWED_AD_FORMATS } from '@/lib/ads/constants'

interface ImageUploadProps {
  bucket: 'ads' | 'articles' | 'magazines'
  value?: string
  onChange: (url: string | null) => void
  label?: string
  accept?: string
  maxSizeMB?: number
  helpText?: string
  allowGif?: boolean
}

export function ImageUpload({
  bucket,
  value,
  onChange,
  label = 'Upload Image',
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSizeMB = 5,
  helpText,
  allowGif = false
}: ImageUploadProps) {
  const isPdf = accept.includes('application/pdf')
  const isAdUpload = bucket === 'ads'
  const strictFileTypes = isAdUpload ? 'image/png,image/jpeg,image/gif' : accept
  const strictMaxSizeMB = isAdUpload ? 2 : maxSizeMB

  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [fileName, setFileName] = useState<string | null>(
    isPdf && value ? decodeURIComponent(value.split('/').pop() || 'Current PDF') : null
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (isAdUpload) {
      if (!ALLOWED_AD_FORMATS.mimeTypes.includes(file.type)) {
        return `Invalid file type. Allowed formats: ${ALLOWED_AD_FORMATS.display}`
      }
    } else {
      const allowedTypes = accept.split(',').map(t => t.trim())
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
      }
    }
    
    const maxSize = isAdUpload ? strictMaxSizeMB : maxSizeMB
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSize}MB`
    }
    return null
  }

  const performUpload = async (file: File) => {
    try {
      if (!isPdf) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFileName(file.name)
      }

      const supabase = createClient()
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${bucket}/${timestamp}-${randomStr}-${sanitizedName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(uploadError.message || 'Upload failed')
      }

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      onChange(publicUrl)
    } catch (err) {
      console.error('[v0] Upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
      setFileName(null)
      onChange(null)
    } finally {
      setIsUploading(false)
    }
  }

  const uploadFile = async (file: File) => {
    setError(null)
    setIsUploading(true)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setIsUploading(false)
      return
    }

    await performUpload(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      uploadFile(file)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setFileName(null)
    onChange(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const hasFile = preview || fileName

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-foreground">{label}</label>
        {helpText && <span className="text-xs text-muted-foreground">{helpText}</span>}
      </div>
      
      {hasFile ? (
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
          {isPdf && fileName ? (
            <div className="flex items-center gap-4 p-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{fileName}</p>
                <p className="text-sm text-muted-foreground">PDF Document</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full max-w-md">
              <Image
                src={preview!}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-background/90 hover:bg-background rounded-full shadow-md transition"
              aria-label="Replace file"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-destructive/90 hover:bg-destructive text-white rounded-full shadow-md transition"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }
            ${isUploading ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-muted">
                {isPdf ? (
                  <FileText className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Click or drag {isPdf ? 'PDF' : 'image'} to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAdUpload 
                    ? `JPG, JPEG, PNG, WebP, GIF up to ${strictMaxSizeMB}MB`
                    : `${isPdf ? 'PDF' : 'JPG, PNG, WEBP'} up to ${maxSizeMB}MB`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />
    </div>
  )
}
