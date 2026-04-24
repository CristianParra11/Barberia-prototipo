import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// Función para generar ID único
function generateProveedorId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `prov-${timestamp}-${randomStr}`
}

// GET - Obtener todos los proveedores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let sql = `SELECT * FROM proveedores`
    const params: any[] = []

    if (search) {
      sql += ` WHERE (nombre LIKE ? OR contacto LIKE ? OR telefono LIKE ? OR email LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    sql += ` ORDER BY created_at DESC`

    const proveedores = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: proveedores,
      total: Array.isArray(proveedores) ? proveedores.length : 0,
    })
  } catch (error) {
    console.error("Error fetching proveedores:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los proveedores",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// POST - Crear nuevo proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validaciones básicas
    if (!body.nombre || !body.contacto || !body.telefono) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios",
          details: "Nombre, contacto y teléfono son obligatorios",
        },
        { status: 400 },
      )
    }

    // Verificar email único (si se proporciona)
    if (body.email) {
      const emailExists = await query("SELECT id FROM proveedores WHERE email = ?", [body.email])

      if (Array.isArray(emailExists) && emailExists.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un proveedor con este email",
          },
          { status: 400 },
        )
      }
    }

    // Generar ID automático
    const id = generateProveedorId()

    const sql = `
      INSERT INTO proveedores (
        id, nombre, contacto, telefono, email, direccion, notas, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      id,
      body.nombre,
      body.contacto,
      body.telefono,
      body.email || null,
      body.direccion || null,
      body.notas || null,
      body.estado || "activo",
    ]

    await query(sql, params)

    // Obtener el proveedor creado
    const nuevoProveedor = await query("SELECT * FROM proveedores WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      data: Array.isArray(nuevoProveedor) ? nuevoProveedor[0] : nuevoProveedor,
      message: "Proveedor creado exitosamente",
    })
  } catch (error) {
    console.error("Error creating proveedor:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el proveedor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
