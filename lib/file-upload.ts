import { writeFile, mkdir, unlink, access } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export interface UploadResult {
  success: boolean
  filePath?: string
  fileName?: string
  error?: string
}

export interface FileValidation {
  maxSize: number // en bytes
  allowedTypes: string[]
  allowedExtensions: string[]
}

// Configuraciones por tipo de archivo
export const FILE_CONFIGS = {
  logo: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    folder: "logos",
  },
  empleado: {
    maxSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    folder: "empleados",
  },
  producto: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    folder: "productos",
  },
  cliente: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    folder: "clientes",
  },
}

export class FileUploadManager {
  private static instance: FileUploadManager
  private uploadsDir: string

  private constructor() {
    this.uploadsDir = join(process.cwd(), "public", "uploads")
  }

  static getInstance(): FileUploadManager {
    if (!FileUploadManager.instance) {
      FileUploadManager.instance = new FileUploadManager()
    }
    return FileUploadManager.instance
  }

  // Validar archivo
  validateFile(file: File, type: keyof typeof FILE_CONFIGS): { valid: boolean; error?: string } {
    const config = FILE_CONFIGS[type]

    // Validar tamaño
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Máximo permitido: ${this.formatFileSize(config.maxSize)}`,
      }
    }

    // Validar tipo MIME
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${config.allowedTypes.join(", ")}`,
      }
    }

    // Validar extensión
    const extension = this.getFileExtension(file.name).toLowerCase()
    if (!config.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Extensión no permitida. Extensiones permitidas: ${config.allowedExtensions.join(", ")}`,
      }
    }

    return { valid: true }
  }

  // Subir archivo
  async uploadFile(file: File, type: keyof typeof FILE_CONFIGS, customName?: string): Promise<UploadResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(file, type)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        }
      }

      const config = FILE_CONFIGS[type]

      // Crear directorio si no existe
      const typeDir = join(this.uploadsDir, config.folder)
      await this.ensureDirectoryExists(typeDir)

      // Generar nombre único
      const extension = this.getFileExtension(file.name)
      const fileName = customName
        ? `${this.sanitizeFileName(customName)}_${uuidv4()}${extension}`
        : `${uuidv4()}${extension}`

      // Ruta completa del archivo
      const filePath = join(typeDir, fileName)

      // Convertir File a Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Escribir archivo
      await writeFile(filePath, buffer)

      // Retornar ruta relativa para la BD
      const relativePath = `/uploads/${config.folder}/${fileName}`

      return {
        success: true,
        filePath: relativePath,
        fileName: fileName,
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      return {
        success: false,
        error: "Error interno al subir el archivo",
      }
    }
  }

  // Eliminar archivo
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (!filePath || filePath.startsWith("http")) {
        return true // No es un archivo local
      }

      // Convertir ruta relativa a absoluta
      const absolutePath = join(process.cwd(), "public", filePath)

      // Verificar si existe
      try {
        await access(absolutePath)
        await unlink(absolutePath)
        return true
      } catch {
        // El archivo no existe, no es un error
        return true
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      return false
    }
  }

  // Mover archivo temporal a definitivo
  async moveFile(tempPath: string, finalPath: string): Promise<boolean> {
    try {
      const tempAbsolute = join(process.cwd(), "public", tempPath)
      const finalAbsolute = join(process.cwd(), "public", finalPath)

      // Asegurar que el directorio de destino existe
      const finalDir = join(finalAbsolute, "..")
      await this.ensureDirectoryExists(finalDir)

      // Mover archivo (renombrar)
      const { rename } = await import("fs/promises")
      await rename(tempAbsolute, finalAbsolute)

      return true
    } catch (error) {
      console.error("Error moving file:", error)
      return false
    }
  }

  // Limpiar archivos huérfanos
  async cleanupOrphanedFiles(type: keyof typeof FILE_CONFIGS, usedPaths: string[]): Promise<number> {
    try {
      const config = FILE_CONFIGS[type]
      const typeDir = join(this.uploadsDir, config.folder)

      const { readdir } = await import("fs/promises")
      const files = await readdir(typeDir)

      let deletedCount = 0

      for (const file of files) {
        const filePath = `/uploads/${config.folder}/${file}`

        if (!usedPaths.includes(filePath)) {
          const success = await this.deleteFile(filePath)
          if (success) deletedCount++
        }
      }

      return deletedCount
    } catch (error) {
      console.error("Error cleaning up files:", error)
      return 0
    }
  }

  // Utilidades privadas
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await access(dirPath)
    } catch {
      await mkdir(dirPath, { recursive: true })
    }
  }

  private getFileExtension(fileName: string): string {
    return fileName.substring(fileName.lastIndexOf("."))
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Obtener información del archivo
  getFileInfo(filePath: string): { exists: boolean; url: string; type?: string } {
    if (!filePath) {
      return { exists: false, url: "" }
    }

    // Si es una URL externa, retornar tal como está
    if (filePath.startsWith("http")) {
      return { exists: true, url: filePath, type: "external" }
    }

    // Si es una ruta local, construir URL completa
    const url = filePath.startsWith("/") ? filePath : `/${filePath}`

    return {
      exists: true,
      url: url,
      type: "local",
    }
  }

  // Generar URL temporal para preview
  generatePreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  // Limpiar URLs temporales
  revokePreviewUrl(url: string): void {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }
}

// Instancia singleton
export const fileUploadManager = FileUploadManager.getInstance()

// Utilidades exportadas
export const validateFileType = (file: File, type: keyof typeof FILE_CONFIGS) => {
  return fileUploadManager.validateFile(file, type)
}

export const uploadFile = (file: File, type: keyof typeof FILE_CONFIGS, customName?: string) => {
  return fileUploadManager.uploadFile(file, type, customName)
}

export const deleteFile = (filePath: string) => {
  return fileUploadManager.deleteFile(filePath)
}

export const getFileInfo = (filePath: string) => {
  return fileUploadManager.getFileInfo(filePath)
}
