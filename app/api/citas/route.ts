import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { v4 as uuidv4 } from "uuid"

// GET - Obtener todas las citas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const fecha = searchParams.get("fecha")

    let sql = `
      SELECT 
        c.*,
        cl.nombre as cliente_nombre,
        cl.apellido as cliente_apellido,
        cl.email as cliente_email,
        cl.telefono as cliente_telefono,
        cl.foto as cliente_foto,
        e.nombre as empleado_nombre,
        e.apellido as empleado_apellido,
        e.email as empleado_email,
        e.telefono as empleado_telefono,
        e.puesto as empleado_puesto,
        e.foto as empleado_foto
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN empleados e ON c.empleado_id = e.id
    `

    const params: any[] = []
    const conditions: string[] = []

    if (fecha) {
      conditions.push("c.fecha = ?")
      params.push(fecha)
    }

    if (search) {
      conditions.push(`(
        cl.nombre LIKE ? OR 
        cl.apellido LIKE ? OR 
        e.nombre LIKE ? OR 
        e.apellido LIKE ? OR
        c.notas LIKE ?
      )`)
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += " ORDER BY c.fecha DESC, c.hora_inicio DESC"

    console.log("SQL Query:", sql)
    console.log("Params:", params)

    const citas = (await query(sql, params)) as any[]

    // Obtener servicios para cada cita
    for (const cita of citas) {
      const serviciosSql = `
        SELECT 
          cs.*,
          s.nombre,
          s.descripcion,
          s.duracion,
          s.categoria,
          s.imagen
        FROM cita_servicios cs
        LEFT JOIN servicios s ON cs.servicio_id = s.id
        WHERE cs.cita_id = ?
      `
      const servicios = (await query(serviciosSql, [cita.id])) as any[]
      cita.servicios = servicios
    }

    return NextResponse.json({
      success: true,
      data: citas,
      total: citas.length,
    })
  } catch (error) {
    console.error("Error al obtener citas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// POST - Crear nueva cita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Datos recibidos para crear cita:", body)

    const {
      fecha,
      hora_inicio,
      hora_fin,
      cliente_id,
      empleado_id,
      servicio_ids,
      notas,
      estado = "programada",
      precio_total,
    } = body

    // Validaciones
    if (!fecha || !hora_inicio || !hora_fin || !cliente_id || !empleado_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios: fecha, hora_inicio, hora_fin, cliente_id, empleado_id",
        },
        { status: 400 },
      )
    }

    if (!servicio_ids || !Array.isArray(servicio_ids) || servicio_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe seleccionar al menos un servicio",
        },
        { status: 400 },
      )
    }

    // Verificar que el cliente existe
    const clienteExists = await query("SELECT id FROM clientes WHERE id = ?", [cliente_id])
    if (!Array.isArray(clienteExists) || clienteExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El cliente especificado no existe",
        },
        { status: 400 },
      )
    }

    // Verificar que el empleado existe y está activo
    const empleadoExists = await query("SELECT id FROM empleados WHERE id = ? AND estado = 'activo'", [empleado_id])
    if (!Array.isArray(empleadoExists) || empleadoExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El empleado especificado no existe o no está activo",
        },
        { status: 400 },
      )
    }

    // Verificar disponibilidad del empleado
    const conflictoSql = `
      SELECT id FROM citas 
      WHERE empleado_id = ? 
      AND fecha = ? 
      AND estado != 'cancelada'
      AND (
        (hora_inicio <= ? AND hora_fin > ?) OR
        (hora_inicio < ? AND hora_fin >= ?) OR
        (hora_inicio >= ? AND hora_fin <= ?)
      )
    `
    const conflictos = (await query(conflictoSql, [
      empleado_id,
      fecha,
      hora_inicio,
      hora_inicio,
      hora_fin,
      hora_fin,
      hora_inicio,
      hora_fin,
    ])) as any[]

    if (conflictos.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El empleado no está disponible en el horario seleccionado",
        },
        { status: 400 },
      )
    }

    // Generar ID único para la cita
    const citaId = uuidv4()

    // Insertar la cita
    const insertCitaSql = `
      INSERT INTO citas (
        id, fecha, hora_inicio, hora_fin, cliente_id, empleado_id, 
        estado, notas, precio_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await query(insertCitaSql, [
      citaId,
      fecha,
      hora_inicio,
      hora_fin,
      cliente_id,
      empleado_id,
      estado,
      notas || null,
      precio_total || 0,
    ])

    // Insertar los servicios de la cita
    for (const servicio_id of servicio_ids) {
      // Obtener el precio del servicio
      const servicioData = (await query("SELECT precio FROM servicios WHERE id = ?", [servicio_id])) as any[]

      if (servicioData.length === 0) {
        console.warn(`Servicio ${servicio_id} no encontrado`)
        continue
      }

      const precioServicio = servicioData[0].precio

      await query("INSERT INTO cita_servicios (cita_id, servicio_id, precio) VALUES (?, ?, ?)", [
        citaId,
        servicio_id,
        precioServicio,
      ])
    }

    // Obtener la cita creada con todos los datos
    const citaCreada = (await query(
      `
      SELECT 
        c.*,
        cl.nombre as cliente_nombre,
        cl.apellido as cliente_apellido,
        e.nombre as empleado_nombre,
        e.apellido as empleado_apellido
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN empleados e ON c.empleado_id = e.id
      WHERE c.id = ?
    `,
      [citaId],
    )) as any[]

    if (citaCreada.length === 0) {
      throw new Error("Error al recuperar la cita creada")
    }

    console.log("Cita creada exitosamente:", citaCreada[0])

    return NextResponse.json(
      {
        success: true,
        data: citaCreada[0],
        message: "Cita creada exitosamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear cita:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
