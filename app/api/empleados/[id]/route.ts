import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// GET - Obtener empleado por ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de empleado requerido",
        },
        { status: 400 },
      )
    }

    const rows = await query("SELECT * FROM empleados WHERE id = ?", [id])
    const empleados = rows as any[]

    if (empleados.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empleado no encontrado",
        },
        { status: 404 },
      )
    }

    const empleado = empleados[0]
    empleado.especialidades = JSON.parse(empleado.especialidades || "[]")

    // Obtener estadísticas del empleado
    try {
      const citasResult = await query("SELECT COUNT(*) as total FROM citas WHERE empleado_id = ?", [id])
      const citasCompletadasResult = await query(
        "SELECT COUNT(*) as total FROM citas WHERE empleado_id = ? AND estado = 'completada'",
        [id],
      )
      const ventasResult = await query("SELECT COUNT(*) as total FROM ventas WHERE empleado_id = ?", [id])

      const totalCitas = Array.isArray(citasResult) && citasResult.length > 0 ? (citasResult[0] as any).total : 0
      const citasCompletadas =
        Array.isArray(citasCompletadasResult) && citasCompletadasResult.length > 0
          ? (citasCompletadasResult[0] as any).total
          : 0
      const totalVentas = Array.isArray(ventasResult) && ventasResult.length > 0 ? (ventasResult[0] as any).total : 0

      empleado.estadisticas = {
        totalCitas,
        citasCompletadas,
        citasPendientes: totalCitas - citasCompletadas,
        totalVentas,
      }
    } catch (statsError) {
      console.warn("Error al obtener estadísticas:", statsError)
      empleado.estadisticas = {
        totalCitas: 0,
        citasCompletadas: 0,
        citasPendientes: 0,
        totalVentas: 0,
      }
    }

    return NextResponse.json({
      success: true,
      data: empleado,
    })
  } catch (error) {
    console.error("Error al obtener empleado:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

// PUT - Actualizar empleado
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de empleado requerido",
        },
        { status: 400 },
      )
    }

    // Verificar que el empleado existe
    const existing = await query("SELECT id FROM empleados WHERE id = ?", [id])
    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empleado no encontrado",
        },
        { status: 404 },
      )
    }

    // Verificar email único (excluyendo el empleado actual)
    if (body.email) {
      const existingEmail = await query("SELECT id FROM empleados WHERE email = ? AND id != ?", [body.email, id])
      if ((existingEmail as any[]).length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un empleado con este email",
          },
          { status: 400 },
        )
      }
    }

    // Preparar campos para actualizar
    const updateFields: string[] = []
    const updateValues: any[] = []

    const allowedFields = ["nombre", "apellido", "email", "telefono", "puesto", "fecha_contratacion", "estado", "foto"]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(body[field])
      }
    })

    // Manejar especialidades (JSON)
    if (body.especialidades !== undefined) {
      updateFields.push("especialidades = ?")
      updateValues.push(JSON.stringify(body.especialidades))
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay campos para actualizar",
        },
        { status: 400 },
      )
    }

    updateValues.push(id)

    // Ejecutar actualización
    await query(`UPDATE empleados SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    // Obtener empleado actualizado
    const rows = await query("SELECT * FROM empleados WHERE id = ?", [id])
    const empleado = (rows as any[])[0]
    if (empleado) {
      empleado.especialidades = JSON.parse(empleado.especialidades || "[]")
    }

    return NextResponse.json({
      success: true,
      data: empleado,
      message: "Empleado actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar empleado:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

// DELETE - Eliminar empleado
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de empleado requerido",
        },
        { status: 400 },
      )
    }

    // Verificar que el empleado existe
    const existing = await query("SELECT nombre, apellido FROM empleados WHERE id = ?", [id])
    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empleado no encontrado",
        },
        { status: 404 },
      )
    }

    const empleado = (existing as any[])[0]

    // Verificar si tiene citas asociadas
    try {
      const citas = await query("SELECT COUNT(*) as total FROM citas WHERE empleado_id = ?", [id])
      const totalCitas = Array.isArray(citas) && citas.length > 0 ? (citas[0] as any).total : 0

      if (totalCitas > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No se puede eliminar el empleado porque tiene citas asociadas",
          },
          { status: 400 },
        )
      }
    } catch (citasError) {
      console.warn("Error al verificar citas:", citasError)
    }

    // Eliminar empleado
    await query("DELETE FROM empleados WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: `Empleado ${empleado.nombre} ${empleado.apellido} eliminado exitosamente`,
    })
  } catch (error) {
    console.error("Error al eliminar empleado:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
