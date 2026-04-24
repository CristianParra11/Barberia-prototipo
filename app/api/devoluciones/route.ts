import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { venta_id, productos, motivo, observaciones, total } = body

    console.log("API Devoluciones - POST request:", body)

    // Validaciones
    if (!venta_id || !productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de devolución incompletos",
        },
        { status: 400 },
      )
    }

    if (!motivo?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "El motivo de la devolución es requerido",
        },
        { status: 400 },
      )
    }

    // Verificar que la venta existe y está completada
    const ventaExistente = await query("SELECT * FROM ventas WHERE id = ? AND estado = 'completada'", [venta_id])

    if (!Array.isArray(ventaExistente) || ventaExistente.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Venta no encontrada o no está completada",
        },
        { status: 404 },
      )
    }

    // Generar ID para la devolución
    const devolucionId = `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Crear registro de devolución
    await query(
      `
      INSERT INTO devoluciones (
        id, venta_id, motivo, observaciones, total, fecha, estado
      ) VALUES (?, ?, ?, ?, ?, NOW(), 'procesada')
      `,
      [devolucionId, venta_id, motivo, observaciones || null, total],
    )

    // Procesar cada producto devuelto
    for (const producto of productos) {
      const { producto_id, cantidad, precio_unitario } = producto

      // Registrar detalle de devolución
      await query(
        `
        INSERT INTO devolucion_productos (
          devolucion_id, producto_id, cantidad, precio_unitario, subtotal
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [devolucionId, producto_id, cantidad, precio_unitario, cantidad * precio_unitario],
      )

      // Restaurar stock del producto
      await query("UPDATE productos SET stock = stock + ? WHERE id = ?", [cantidad, producto_id])

      console.log(`Stock restaurado: ${cantidad} unidades del producto ${producto_id}`)
    }

    // Actualizar estado de la venta si es devolución total
    const productosVenta = await query(
      "SELECT SUM(cantidad) as total_vendido FROM venta_productos WHERE venta_id = ?",
      [venta_id],
    )

    const totalDevuelto = await query(
      `
      SELECT SUM(dp.cantidad) as total_devuelto 
      FROM devolucion_productos dp
      INNER JOIN devoluciones d ON dp.devolucion_id = d.id
      WHERE d.venta_id = ?
      `,
      [venta_id],
    )

    const totalVendido = (productosVenta as any[])[0]?.total_vendido || 0
    const totalDevueltoNum = (totalDevuelto as any[])[0]?.total_devuelto || 0

    if (totalDevueltoNum >= totalVendido) {
      await query("UPDATE ventas SET estado = 'devuelta' WHERE id = ?", [venta_id])
    }

    console.log("Devolución procesada exitosamente:", devolucionId)

    return NextResponse.json({
      success: true,
      data: {
        id: devolucionId,
        venta_id,
        total,
        productos_devueltos: productos.length,
      },
    })
  } catch (error) {
    console.error("Error processing return:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la devolución",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
