import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/clientes - Iniciando...")

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let sql = `
      SELECT 
        id,
        nombre,
        apellido,
        email,
        telefono,
        DATE_FORMAT(fecha_registro, '%Y-%m-%d') as fecha_registro,
        notas,
        foto,
        created_at,
        updated_at
      FROM clientes 
    `
    const params: any[] = []

    // Aplicar filtro de búsqueda si se proporciona
    if (search) {
      sql += ` WHERE (
        nombre LIKE ? OR 
        apellido LIKE ? OR 
        email LIKE ? OR 
        telefono LIKE ?
      )`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    sql += ` ORDER BY created_at DESC`

    const clientes = await query(sql, params)

    console.log(`Devolviendo ${Array.isArray(clientes) ? clientes.length : 0} clientes`)

    return NextResponse.json({
      success: true,
      data: clientes,
      total: Array.isArray(clientes) ? clientes.length : 0,
    })
  } catch (error) {
    console.error("Error en GET /api/clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/clientes - Iniciando...")

    const body = await request.json()
    console.log("Datos recibidos:", body)

    // Validar campos obligatorios según tu esquema
    const { nombre, apellido, telefono } = body
    if (!nombre || !apellido || !telefono) {
      return NextResponse.json(
        { success: false, error: "Los campos nombre, apellido y teléfono son obligatorios" },
        { status: 400 },
      )
    }

    // Validar email si se proporciona
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ success: false, error: "El formato del email no es válido" }, { status: 400 })
    }

    // Verificar duplicados
    if (body.email) {
      const emailExiste = await query("SELECT id FROM clientes WHERE email = ?", [body.email])
      if (Array.isArray(emailExiste) && emailExiste.length > 0) {
        return NextResponse.json({ success: false, error: "Ya existe un cliente con este email" }, { status: 409 })
      }
    }

    const telefonoExiste = await query("SELECT id FROM clientes WHERE telefono = ?", [body.telefono])
    if (Array.isArray(telefonoExiste) && telefonoExiste.length > 0) {
      return NextResponse.json({ success: false, error: "Ya existe un cliente con este teléfono" }, { status: 409 })
    }

    // Generar UUID para el ID
    const clienteId = `cli-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Insertar nuevo cliente según tu esquema
    const sql = `
      INSERT INTO clientes (
        id, nombre, apellido, email, telefono, 
        fecha_registro, notas, foto
      ) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)
    `

    const params = [
      clienteId,
      nombre.trim(),
      apellido.trim(),
      body.email?.trim() || null,
      telefono.trim(),
      body.notas?.trim() || null,
      body.foto || null,
    ]

    await query(sql, params)

    // Obtener el cliente recién creado
    const nuevoCliente = await query(
      `SELECT 
        id, nombre, apellido, email, telefono,
        DATE_FORMAT(fecha_registro, '%Y-%m-%d') as fecha_registro,
        notas, foto, created_at, updated_at
      FROM clientes WHERE id = ?`,
      [clienteId],
    )

    console.log("Cliente creado con ID:", clienteId)

    return NextResponse.json(
      {
        success: true,
        data: Array.isArray(nuevoCliente) ? nuevoCliente[0] : nuevoCliente,
        message: "Cliente creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error en POST /api/clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 500 },
    )
  }
}
