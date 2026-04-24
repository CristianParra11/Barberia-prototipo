import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = (formData.get("type") as string) || "general"

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Formato de archivo no válido. Use JPG, PNG o GIF." }, { status: 400 })
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no debe superar los 5MB" }, { status: 400 })
    }

    // Determinar el directorio según el tipo
    let uploadDir = ""
    switch (type) {
      case "cliente":
        uploadDir = "uploads/clientes"
        break
      case "empleado":
        uploadDir = "uploads/empleados"
        break
      case "producto":
        uploadDir = "uploads/productos"
        break
      case "servicio":
        uploadDir = "uploads/servicios"
        break
      case "logo":
        uploadDir = "uploads/configuracion"
        break
      default:
        uploadDir = "uploads/general"
    }

    // Crear directorio si no existe
    const publicDir = path.join(process.cwd(), "public")
    const targetDir = path.join(publicDir, uploadDir)

    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Obtener extensión del archivo original
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"

    // Crear nombre de archivo único
    const fileName = `${type}-${Date.now()}-${uuidv4().substring(0, 8)}.${fileExt}`
    const filePath = path.join(targetDir, fileName)

    // Guardar archivo
    await writeFile(filePath, buffer)

    // Devolver URL relativa para acceder al archivo
    const fileUrl = `/${uploadDir}/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
    })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ error: "Error al procesar la subida del archivo" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
