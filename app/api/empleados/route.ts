import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let sql = `
      SELECT 
        id, nombre, apellido, email, telefono, puesto, 
        fecha_contratacion, estado, especialidades, foto,
        usuario_id, created_at, updated_at
      FROM empleados
    `
    const params: any[] = []

    if (search) {
      sql += ` WHERE (nombre LIKE ? OR apellido LIKE ? OR email LIKE ? OR puesto LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    sql += ` ORDER BY created_at DESC`

    const rows = await query(sql, params)
    const empleados = (rows as any[]).map((empleado) => ({
      ...empleado,
      especialidades: empleado.especialidades ? JSON.parse(empleado.especialidades) : [],
    }))

    return NextResponse.json({
      success: true,
      data: empleados,
      total: empleados.length,
    })
  } catch (error) {
    console.error("Error al obtener empleados:", error)
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
    const { nombre, apellido, email, telefono, puesto, fecha_contratacion, estado, especialidades, foto } = body

    // Validaciones
    if (!nombre || !apellido || !email || !telefono || !puesto || !fecha_contratacion) {
      return NextResponse.json(
        {
          success: false,
          error: "Todos los campos obligatorios deben ser completados",
        },
        { status: 400 },
      )
    }

    // Verificar email único
    const existingEmail = await query("SELECT id FROM empleados WHERE email = ?", [email])
    if ((existingEmail as any[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe un empleado con este email",
        },
        { status: 400 },
      )
    }

    // Generar ID secuencial
    const maxIdResult = await query(
      "SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM empleados WHERE id REGEXP '^[0-9]+$'",
    )
    const maxId = (maxIdResult as any[])[0]?.maxId || 0
    const newId = (maxId + 1).toString()

    // Insertar empleado
    const especialidadesJson = JSON.stringify(especialidades || [])

    await query(
      `INSERT INTO empleados 
       (id, nombre, apellido, email, telefono, puesto, fecha_contratacion, estado, especialidades, foto) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        nombre,
        apellido,
        email,
        telefono,
        puesto,
        fecha_contratacion,
        estado || "activo",
        especialidadesJson,
        foto,
      ],
    )

    // Obtener el empleado creado
    const rows = await query("SELECT * FROM empleados WHERE id = ?", [newId])
    const empleado = (rows as any[])[0]
    if (empleado) {
      empleado.especialidades = JSON.parse(empleado.especialidades || "[]")
    }

    return NextResponse.json({
      success: true,
      data: empleado,
      message: "Empleado creado exitosamente",
    })
  } catch (error) {
    console.error("Error al crear empleado:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
