import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// GET - Obtener una cita específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    // Obtener la cita con datos relacionados
    const citaSql = `
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
      WHERE c.id = ?
    `

    const citas = (await query(citaSql, [id])) as any[]

    if (citas.length === 0) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 })
    }

    const cita = citas[0]

    // Obtener servicios de la cita
    const serviciosSql = `
      SELECT 
        cs.*,
        s.nombre,
        s.descripcion,
        s.duracion,
        s.categoria,
        s.imagen,
        s.precio as precio_actual
      FROM cita_servicios cs
      LEFT JOIN servicios s ON cs.servicio_id = s.id
      WHERE cs.cita_id = ?
    `
    const servicios = (await query(serviciosSql, [id])) as any[]
    cita.servicios = servicios

    return NextResponse.json({
      success: true,
      data: cita,
    })
  } catch (error) {
    console.error("Error al obtener cita:", error)
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

// PUT - Actualizar una cita
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log("Actualizando cita:", id, body)

    // Verificar que la cita existe
    const citaExists = (await query("SELECT id FROM citas WHERE id = ?", [id])) as any[]
    if (citaExists.length === 0) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 })
    }

    const { fecha, hora_inicio, hora_fin, cliente_id, empleado_id, servicio_ids, notas, estado, precio_total } = body

    // Si solo se está actualizando el estado
    if (estado && Object.keys(body).length === 1) {
      await query("UPDATE citas SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [estado, id])

      const citaActualizada = (await query(
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
        [id],
      )) as any[]

      return NextResponse.json({
        success: true,
        data: citaActualizada[0],
        message: "Estado de cita actualizado exitosamente",
      })
    }

    // Actualización completa
    if (empleado_id && fecha && hora_inicio && hora_fin) {
      // Verificar disponibilidad del empleado (excluyendo la cita actual)
      const conflictoSql = `
        SELECT id FROM citas 
        WHERE empleado_id = ? 
        AND fecha = ? 
        AND estado != 'cancelada'
        AND id != ?
        AND (
          (hora_inicio <= ? AND hora_fin > ?) OR
          (hora_inicio < ? AND hora_fin >= ?) OR
          (hora_inicio >= ? AND hora_fin <= ?)
        )
      `
      const conflictos = (await query(conflictoSql, [
        empleado_id,
        fecha,
        id,
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
    }

    // Actualizar la cita
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (fecha !== undefined) {
      updateFields.push("fecha = ?")
      updateValues.push(fecha)
    }
    if (hora_inicio !== undefined) {
      updateFields.push("hora_inicio = ?")
      updateValues.push(hora_inicio)
    }
    if (hora_fin !== undefined) {
      updateFields.push("hora_fin = ?")
      updateValues.push(hora_fin)
    }
    if (cliente_id !== undefined) {
      updateFields.push("cliente_id = ?")
      updateValues.push(cliente_id)
    }
    if (empleado_id !== undefined) {
      updateFields.push("empleado_id = ?")
      updateValues.push(empleado_id)
    }
    if (estado !== undefined) {
      updateFields.push("estado = ?")
      updateValues.push(estado)
    }
    if (notas !== undefined) {
      updateFields.push("notas = ?")
      updateValues.push(notas)
    }
    if (precio_total !== undefined) {
      updateFields.push("precio_total = ?")
      updateValues.push(precio_total)
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(id)

    if (updateFields.length > 1) {
      // > 1 porque siempre tenemos updated_at
      const updateSql = `UPDATE citas SET ${updateFields.join(", ")} WHERE id = ?`
      await query(updateSql, updateValues)
    }

    // Actualizar servicios si se proporcionaron
    if (servicio_ids && Array.isArray(servicio_ids)) {
      // Eliminar servicios existentes
      await query("DELETE FROM cita_servicios WHERE cita_id = ?", [id])

      // Insertar nuevos servicios
      for (const servicio_id of servicio_ids) {
        const servicioData = (await query("SELECT precio FROM servicios WHERE id = ?", [servicio_id])) as any[]

        if (servicioData.length > 0) {
          const precioServicio = servicioData[0].precio
          await query("INSERT INTO cita_servicios (cita_id, servicio_id, precio) VALUES (?, ?, ?)", [
            id,
            servicio_id,
            precioServicio,
          ])
        }
      }
    }

    // Obtener la cita actualizada
    const citaActualizada = (await query(
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
      [id],
    )) as any[]

    return NextResponse.json({
      success: true,
      data: citaActualizada[0],
      message: "Cita actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar cita:", error)
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

// DELETE - Eliminar una cita
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    // Verificar que la cita existe
    const citaExists = (await query("SELECT id FROM citas WHERE id = ?", [id])) as any[]
    if (citaExists.length === 0) {
      return NextResponse.json({ success: false, error: "Cita no encontrada" }, { status: 404 })
    }

    // Eliminar servicios de la cita (se eliminan automáticamente por CASCADE)
    // Eliminar la cita
    await query("DELETE FROM citas WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: "Cita eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar cita:", error)
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
