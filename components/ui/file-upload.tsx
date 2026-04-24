"use client"

import React, { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, FileImage, AlertCircle } from "lucide-react"
import { FILE_CONFIGS, validateFileType, getFileInfo } from "@/lib/file-upload"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  value?: string | null
  onChange: (filePath: string | null) => void
  type: keyof typeof FILE_CONFIGS
  label?: string
  description?: string
  placeholder?: React.ReactNode
  className?: string
  disabled?: boolean
  customName?: string
  showPreview?: boolean
  aspectRatio?: "square" | "video" | "auto"
}

export function FileUpload({
  value,
  onChange,
  type,
  label,
  description,
  placeholder,
  className,
  disabled = false,
  customName,
  showPreview = true,
  aspectRatio = "auto",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const config = FILE_CONFIGS[type]

  // Limpiar preview URL cuando cambie el valor
  React.useEffect(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [value])

  // Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (disabled) return

      // Validar archivo
      const validation = validateFileType(file, type)
      if (!validation.valid) {
        toast({
          title: "Archivo no válido",
          description: validation.error,
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      try {
        // Crear preview inmediato
        const tempPreviewUrl = URL.createObjectURL(file)
        setPreviewUrl(tempPreviewUrl)

        // Preparar FormData
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)
        if (customName) {
          formData.append("customName", customName)
        }

        console.log("Uploading file:", { name: file.name, size: file.size, type })

        // Subir archivo
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          // Limpiar preview temporal
          URL.revokeObjectURL(tempPreviewUrl)
          setPreviewUrl(null)

          // Actualizar valor con la ruta del archivo
          onChange(result.data.filePath)

          toast({
            title: "Archivo subido",
            description: "El archivo se ha subido correctamente",
          })
        } else {
          throw new Error(result.error || "Error al subir el archivo")
        }
      } catch (error) {
        console.error("Error uploading file:", error)

        // Limpiar preview en caso de error
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
          setPreviewUrl(null)
        }

        toast({
          title: "Error al subir archivo",
          description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [disabled, type, customName, onChange, toast, previewUrl],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragActive(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemove = async () => {
    if (disabled) return

    try {
      // Si hay un archivo en el servidor, intentar eliminarlo
      if (value && !value.startsWith("blob:") && !value.startsWith("http")) {
        await fetch(`/api/upload?filePath=${encodeURIComponent(value)}`, {
          method: "DELETE",
        })
      }

      // Limpiar preview si existe
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }

      onChange(null)

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast({
        title: "Archivo eliminado",
        description: "El archivo se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error removing file:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      })
    }
  }

  const triggerFileInput = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  // Determinar qué imagen mostrar
  const displayImage = previewUrl || value
  const fileInfo = value ? getFileInfo(value) : null

  // Clases para aspect ratio
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400",
          "min-h-[120px] flex items-center justify-center",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={config.allowedTypes.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-2 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Subiendo archivo...</p>
          </div>
        ) : displayImage && showPreview ? (
          <div className="relative group w-full h-full min-h-[120px]">
            <div className={cn("relative w-full h-full", aspectRatioClasses[aspectRatio])}>
              <Image
                src={displayImage || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
                onError={() => {
                  console.error("Error loading image:", displayImage)
                  onChange(null)
                }}
              />
            </div>

            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerFileInput()
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Cambiar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove()
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 p-6 text-center">
            {placeholder || (
              <>
                <FileImage className="h-12 w-12 text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Haz clic para subir o arrastra un archivo aquí</p>
                  <p className="text-xs text-gray-500">
                    {config.allowedExtensions.join(", ")} hasta {Math.round(config.maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-500 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {description}
        </p>
      )}

      {fileInfo && fileInfo.exists && (
        <div className="text-xs text-gray-500">
          <p>Archivo: {fileInfo.type === "local" ? "Local" : "Externo"}</p>
        </div>
      )}
    </div>
  )
}
