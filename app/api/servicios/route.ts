import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let sql = `
      SELECT 
        id, nombre, descripcion, precio, duracion, categoria, 
        imagen, destacado, estado, created_at, updated_at
      FROM servicios 
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    sql += ` ORDER BY destacado DESC, nombre ASC`

    const servicios = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: servicios.map((servicio: any) => ({
        ...servicio,
        destacado: Boolean(servicio.destacado),
        precio: Number(servicio.precio),
        duracion: Number(servicio.duracion),
      })),
    })
  } catch (error) {
    console.error("Error al obtener servicios:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, precio, duracion, categoria, imagen, destacado, estado } = body

    // Validaciones
    if (!nombre || !precio || !duracion || !categoria) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios",
        },
        { status: 400 },
      )
    }

    // Generar ID único
    const id = `serv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const sql = `
      INSERT INTO servicios (
        id, nombre, descripcion, precio, duracion, categoria, 
        imagen, destacado, estado, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    await query(sql, [
      id,
      nombre,
      descripcion || null,
      Number(precio),
      Number(duracion),
      categoria,
      imagen || null,
      Boolean(destacado),
      estado || "activo",
    ])

    // Obtener el servicio creado
    const servicioCreado = await query("SELECT * FROM servicios WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      data: {
        ...servicioCreado[0],
        destacado: Boolean(servicioCreado[0].destacado),
        precio: Number(servicioCreado[0].precio),
        duracion: Number(servicioCreado[0].duracion),
      },
      message: "Servicio creado exitosamente",
    })
  } catch (error) {
    console.error("Error al crear servicio:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
