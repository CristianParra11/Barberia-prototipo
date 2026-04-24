import { type NextRequest, NextResponse } from "next/server"
import { query, getOne, update, remove } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`GET /api/clientes/${params.id} - Iniciando...`)

    const cliente = await getOne(
      `SELECT 
        id, nombre, apellido, email, telefono,
        DATE_FORMAT(fecha_registro, '%Y-%m-%d') as fecha_registro,
        notas, foto, created_at, updated_at
      FROM clientes WHERE id = ?`,
      [params.id],
    )

    if (!cliente) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 })
    }

    // Obtener estadísticas del cliente
    const [totalCitasResult, totalComprasResult, citasCompletadasResult] = await Promise.all([
      query("SELECT COUNT(*) as total FROM citas WHERE cliente_id = ?", [params.id]),
      query("SELECT COUNT(*) as total FROM ventas WHERE cliente_id = ?", [params.id]),
      query("SELECT COUNT(*) as total FROM citas WHERE cliente_id = ? AND estado = 'completada'", [params.id]),
    ])

    const totalCitas =
      Array.isArray(totalCitasResult) && totalCitasResult.length > 0 ? (totalCitasResult[0] as any).total || 0 : 0
    const totalCompras =
      Array.isArray(totalComprasResult) && totalComprasResult.length > 0 ? (totalComprasResult[0] as any).total || 0 : 0
    const citasCompletadas =
      Array.isArray(citasCompletadasResult) && citasCompletadasResult.length > 0
        ? (citasCompletadasResult[0] as any).total || 0
        : 0

    const clienteConEstadisticas = {
      ...cliente,
      estadisticas: {
        totalCitas,
        totalCompras,
        citasCompletadas,
        citasPendientes: totalCitas - citasCompletadas,
        totalGastado: 0, // Se puede calcular después
      },
    }

    return NextResponse.json({
      success: true,
      data: clienteConEstadisticas,
    })
  } catch (error) {
    console.error(`Error en GET /api/clientes/${params.id}:`, error)
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`PUT /api/clientes/${params.id} - Iniciando...`)

    // Verificar que el cliente existe
    const clienteExiste = await getOne("SELECT id FROM clientes WHERE id = ?", [params.id])
    if (!clienteExiste) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    console.log("Datos para actualizar:", body)

    // Validar email si se proporciona
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ success: false, error: "El formato del email no es válido" }, { status: 400 })
    }

    // Verificar duplicados (excluyendo el cliente actual)
    if (body.email) {
      const emailExiste = await query("SELECT id FROM clientes WHERE email = ? AND id != ?", [body.email, params.id])
      if (Array.isArray(emailExiste) && emailExiste.length > 0) {
        return NextResponse.json({ success: false, error: "Ya existe otro cliente con este email" }, { status: 409 })
      }
    }

    if (body.telefono) {
      const telefonoExiste = await query("SELECT id FROM clientes WHERE telefono = ? AND id != ?", [
        body.telefono,
        params.id,
      ])
      if (Array.isArray(telefonoExiste) && telefonoExiste.length > 0) {
        return NextResponse.json({ success: false, error: "Ya existe otro cliente con este teléfono" }, { status: 409 })
      }
    }

    // Actualizar cliente según tu esquema
    const sql = `
      UPDATE clientes SET 
        nombre = ?, apellido = ?, email = ?, telefono = ?,
        notas = ?, foto = ?
      WHERE id = ?
    `

    const updateParams = [
      body.nombre?.trim(),
      body.apellido?.trim(),
      body.email?.trim() || null,
      body.telefono?.trim(),
      body.notas?.trim() || null,
      body.foto || null,
      params.id,
    ]

    const affectedRows = await update(sql, updateParams)

    if (affectedRows === 0) {
      return NextResponse.json({ success: false, error: "No se pudo actualizar el cliente" }, { status: 400 })
    }

    // Obtener el cliente actualizado
    const clienteActualizado = await getOne(
      `SELECT 
        id, nombre, apellido, email, telefono,
        DATE_FORMAT(fecha_registro, '%Y-%m-%d') as fecha_registro,
        notas, foto, created_at, updated_at
      FROM clientes WHERE id = ?`,
      [params.id],
    )

    console.log("Cliente actualizado:", clienteActualizado)

    return NextResponse.json({
      success: true,
      data: clienteActualizado,
      message: "Cliente actualizado exitosamente",
    })
  } catch (error) {
    console.error(`Error en PUT /api/clientes/${params.id}:`, error)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`DELETE /api/clientes/${params.id} - Iniciando...`)

    // Verificar que el cliente existe
    const cliente = await getOne("SELECT nombre, apellido FROM clientes WHERE id = ?", [params.id])
    if (!cliente) {
      return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 })
    }

    // Verificar si tiene citas o ventas asociadas
    const [citasAsociadasResult, ventasAsociadasResult] = await Promise.all([
      query("SELECT COUNT(*) as total FROM citas WHERE cliente_id = ?", [params.id]),
      query("SELECT COUNT(*) as total FROM ventas WHERE cliente_id = ?", [params.id]),
    ])

    const totalCitas =
      Array.isArray(citasAsociadasResult) && citasAsociadasResult.length > 0
        ? (citasAsociadasResult[0] as any).total || 0
        : 0
    const totalVentas =
      Array.isArray(ventasAsociadasResult) && ventasAsociadasResult.length > 0
        ? (ventasAsociadasResult[0] as any).total || 0
        : 0

    if (totalCitas > 0 || totalVentas > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede eliminar el cliente. Tiene citas o compras asociadas.",
        },
        { status: 409 },
      )
    }

    const affectedRows = await remove("DELETE FROM clientes WHERE id = ?", [params.id])

    if (affectedRows === 0) {
      return NextResponse.json({ success: false, error: "No se pudo eliminar el cliente" }, { status: 400 })
    }

    console.log("Cliente eliminado:", cliente)

    return NextResponse.json({
      success: true,
      message: `Cliente ${cliente.nombre} ${cliente.apellido} eliminado exitosamente`,
    })
  } catch (error) {
    console.error(`Error en DELETE /api/clientes/${params.id}:`, error)

    // Verificar si es un error de clave foránea
    if ((error as any).code === "ER_ROW_IS_REFERENCED_2") {
      return NextResponse.json(
        {
          success: false,
          error: "No se puede eliminar el cliente. Tiene citas o compras asociadas.",
        },
        { status: 409 },
      )
    }

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
