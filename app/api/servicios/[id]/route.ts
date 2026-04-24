import { type NextRequest, NextResponse } from "next/server"
import { query, remove } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del servicio es requerido",
        },
        { status: 400 },
      )
    }

    // Obtener servicio
    const servicios = (await query("SELECT * FROM servicios WHERE id = ?", [id])) as any[]

    if (servicios.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Servicio no encontrado",
        },
        { status: 404 },
      )
    }

    const servicio = servicios[0]

    // Obtener estadísticas del servicio
    const estadisticasCitas = (await query(
      `SELECT 
        COUNT(*) as totalCitas,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) as citasCompletadas,
        SUM(CASE WHEN c.estado = 'programada' THEN 1 ELSE 0 END) as citasProgramadas,
        AVG(cs.precio) as precioPromedio
      FROM cita_servicios cs
      JOIN citas c ON cs.cita_id = c.id
      WHERE cs.servicio_id = ?`,
      [id],
    )) as any[]

    const estadisticas = estadisticasCitas[0] || {
      totalCitas: 0,
      citasCompletadas: 0,
      citasProgramadas: 0,
      precioPromedio: 0,
    }

    const servicioFormateado = {
      ...servicio,
      destacado: Boolean(servicio.destacado),
      precio: Number.parseFloat(servicio.precio),
      estadisticas: {
        totalCitas: Number.parseInt(estadisticas.totalCitas) || 0,
        citasCompletadas: Number.parseInt(estadisticas.citasCompletadas) || 0,
        citasProgramadas: Number.parseInt(estadisticas.citasProgramadas) || 0,
        precioPromedio: Number.parseFloat(estadisticas.precioPromedio) || 0,
      },
    }

    return NextResponse.json({
      success: true,
      data: servicioFormateado,
    })
  } catch (error) {
    console.error("Error al obtener servicio:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, descripcion, precio, duracion, categoria, imagen, destacado, estado } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del servicio es requerido",
        },
        { status: 400 },
      )
    }

    // Verificar que el servicio existe
    const servicioExistente = (await query("SELECT id FROM servicios WHERE id = ?", [id])) as any[]
    if (servicioExistente.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Servicio no encontrado",
        },
        { status: 404 },
      )
    }

    // Validaciones
    if (!nombre || !precio || !duracion || !categoria) {
      return NextResponse.json(
        {
          success: false,
          error: "Los campos nombre, precio, duración y categoría son obligatorios",
        },
        { status: 400 },
      )
    }

    if (precio <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio debe ser mayor que 0",
        },
        { status: 400 },
      )
    }

    if (duracion <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "La duración debe ser mayor que 0",
        },
        { status: 400 },
      )
    }

    // Verificar si ya existe otro servicio con el mismo nombre
    const servicioConMismoNombre = (await query("SELECT id FROM servicios WHERE nombre = ? AND id != ?", [
      nombre,
      id,
    ])) as any[]
    if (servicioConMismoNombre.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Ya existe otro servicio con ese nombre",
        },
        { status: 400 },
      )
    }

    // Actualizar servicio
    const sqlUpdate = `
      UPDATE servicios 
      SET nombre = ?, descripcion = ?, precio = ?, duracion = ?, categoria = ?, 
          imagen = ?, destacado = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    await query(sqlUpdate, [
      nombre,
      descripcion || null,
      Number.parseFloat(precio),
      Number.parseInt(duracion),
      categoria,
      imagen || null,
      destacado ? 1 : 0,
      estado || "activo",
      id,
    ])

    // Obtener el servicio actualizado
    const servicioActualizado = (await query("SELECT * FROM servicios WHERE id = ?", [id])) as any[]

    const servicioFormateado = {
      ...servicioActualizado[0],
      destacado: Boolean(servicioActualizado[0].destacado),
      precio: Number.parseFloat(servicioActualizado[0].precio),
    }

    return NextResponse.json({
      success: true,
      data: servicioFormateado,
      message: "Servicio actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar servicio:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al actualizar servicio",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID del servicio es requerido",
        },
        { status: 400 },
      )
    }

    // Verificar que el servicio existe
    const servicioExistente = (await query("SELECT nombre FROM servicios WHERE id = ?", [id])) as any[]
    if (servicioExistente.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Servicio no encontrado",
        },
        { status: 404 },
      )
    }

    // Verificar si el servicio tiene citas asociadas
    const citasAsociadas = (await query("SELECT COUNT(*) as total FROM cita_servicios WHERE servicio_id = ?", [
      id,
    ])) as any[]
    if (citasAsociadas[0].total > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede eliminar el servicio porque tiene citas asociadas",
        },
        { status: 400 },
      )
    }

    // Eliminar servicio usando la función remove correctamente
    await remove("DELETE FROM servicios WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: `Servicio "${servicioExistente[0].nombre}" eliminado exitosamente`,
    })
  } catch (error) {
    console.error("Error al eliminar servicio:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor al eliminar servicio",
      },
      { status: 500 },
    )
  }
}
