import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("API Ventas - GET by ID:", id)

    // Obtener la venta con datos relacionados
    const venta = await query(
      `
      SELECT 
        v.*,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.email as cliente_email,
        c.telefono as cliente_telefono,
        c.foto as cliente_foto,
        e.nombre as empleado_nombre,
        e.apellido as empleado_apellido,
        e.puesto as empleado_puesto,
        e.foto as empleado_foto
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN empleados e ON v.empleado_id = e.id
      WHERE v.id = ?
      `,
      [id],
    )

    if (!venta || (venta as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Venta no encontrada",
        },
        { status: 404 },
      )
    }

    const ventaData = (venta as any[])[0]

    // Obtener productos de la venta
    const productos = await query(
      `
      SELECT 
        vp.*,
        p.nombre as producto_nombre,
        p.codigo as producto_codigo,
        p.categoria as producto_categoria,
        p.imagen as producto_imagen,
        p.marca as producto_marca
      FROM venta_productos vp
      LEFT JOIN productos p ON vp.producto_id = p.id
      WHERE vp.venta_id = ?
      `,
      [id],
    )

    ventaData.productos = productos

    console.log("Venta found:", ventaData.id)

    return NextResponse.json({
      success: true,
      data: ventaData,
    })
  } catch (error) {
    console.error("Error fetching venta:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener la venta",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    console.log("API Ventas - PUT request:", id, body)

    // Verificar que la venta existe
    const ventaExistente = await query("SELECT id, estado FROM ventas WHERE id = ?", [id])

    if (!ventaExistente || (ventaExistente as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Venta no encontrada",
        },
        { status: 404 },
      )
    }

    const { estado, notas } = body

    // Validar estado
    if (estado && !["completada", "cancelada"].includes(estado)) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado inválido",
        },
        { status: 400 },
      )
    }

    // Actualizar la venta
    await query("UPDATE ventas SET estado = ?, notas = ?, updated_at = NOW() WHERE id = ?", [
      estado || (ventaExistente as any[])[0].estado,
      notas || "",
      id,
    ])

    // Si se cancela la venta, restaurar el stock
    if (estado === "cancelada" && (ventaExistente as any[])[0].estado !== "cancelada") {
      const productos = await query("SELECT producto_id, cantidad FROM venta_productos WHERE venta_id = ?", [id])

      for (const producto of productos as any[]) {
        await query("UPDATE productos SET stock = stock + ?, updated_at = NOW() WHERE id = ?", [
          producto.cantidad,
          producto.producto_id,
        ])
      }
    }

    // Obtener la venta actualizada
    const ventaActualizada = await query(
      `
      SELECT 
        v.*,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        e.nombre as empleado_nombre,
        e.apellido as empleado_apellido
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN empleados e ON v.empleado_id = e.id
      WHERE v.id = ?
      `,
      [id],
    )

    console.log("Venta updated successfully:", id)

    return NextResponse.json({
      success: true,
      data: (ventaActualizada as any[])[0],
      message: "Venta actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error updating venta:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar la venta",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("API Ventas - DELETE request:", id)

    // Verificar que la venta existe
    const ventaExistente = await query("SELECT id, estado FROM ventas WHERE id = ?", [id])

    if (!ventaExistente || (ventaExistente as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Venta no encontrada",
        },
        { status: 404 },
      )
    }

    // Restaurar stock antes de eliminar
    const productos = await query("SELECT producto_id, cantidad FROM venta_productos WHERE venta_id = ?", [id])

    for (const producto of productos as any[]) {
      await query("UPDATE productos SET stock = stock + ?, updated_at = NOW() WHERE id = ?", [
        producto.cantidad,
        producto.producto_id,
      ])
    }

    // Eliminar productos de la venta
    await query("DELETE FROM venta_productos WHERE venta_id = ?", [id])

    // Eliminar la venta
    await query("DELETE FROM ventas WHERE id = ?", [id])

    console.log("Venta deleted successfully:", id)

    return NextResponse.json({
      success: true,
      message: "Venta eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting venta:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar la venta",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
