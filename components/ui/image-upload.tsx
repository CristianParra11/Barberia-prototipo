"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, ImageIcon, User } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null) => void
  size?: "sm" | "md" | "lg"
  className?: string
  type?: "cliente" | "empleado" | "producto" | "logo"
  showPreview?: boolean
}

export function ImageUpload({
  value,
  onChange,
  size = "md",
  className = "",
  type = "cliente",
  showPreview = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Crear preview local
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Subir archivo al servidor
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type) // Use the specified type for proper folder organization

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        onChange(result.url)
        toast({
          title: "Imagen subida",
          description: "La imagen se ha subido correctamente",
        })
      } else {
        throw new Error("Error al subir la imagen")
      }
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      })
      setPreview(value || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // For empleados, show a special layout with circular avatar
  if (type === "empleado" && showPreview) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
          {preview ? (
            <div className="relative w-full h-full">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Foto de perfil"
                fill
                className="object-cover"
                onError={() => {
                  setPreview("/logo-placeholder.png")
                  onChange("/logo-placeholder.png")
                }}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transform translate-x-1 -translate-y-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d]">
              <User className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="cursor-pointer"
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500 mt-1">{isUploading ? "Subiendo..." : "JPG, PNG o GIF. Máximo 5MB."}</p>
        </div>
      </div>
    )
  }

  // Default layout for other types
  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden`}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => {
                setPreview("/logo-placeholder.png")
                onChange("/logo-placeholder.png")
              }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            ) : (
              <>
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-xs">Subir imagen</span>
              </>
            )}
          </button>
        )}
      </div>

      <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Subiendo..." : "Seleccionar imagen"}
        </Button>
      )}
    </div>
  )
}
