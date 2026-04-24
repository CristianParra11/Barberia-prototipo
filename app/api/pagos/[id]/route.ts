import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("API Pagos - GET by ID:", id)

    // Determinar si es una venta, servicio o pago de servicio
    let tipo = "servicio"
    let idReal = id

    if (id.startsWith("V-")) {
      tipo = "venta"
      idReal = id.substring(2)
    } else if (id.startsWith("S-")) {
      tipo = "pago_servicio"
      idReal = id.substring(2)
    } else if (id.startsWith("C-")) {
      tipo = "cita"
      idReal = id.substring(2)
    }

    let transaccion: any = null

    if (tipo === "venta") {
      // Obtener venta
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
        [idReal],
      )

      if (venta && (venta as any[]).length > 0) {
        transaccion = (venta as any[])[0]
        transaccion.tipo = "venta"

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
          [idReal],
        )
        transaccion.productos = productos
      }
    } else if (tipo === "pago_servicio") {
      // Obtener pago de servicio
      const pagoServicio = await query(
        `
        SELECT 
          ps.*,
          c.nombre as cliente_nombre,
          c.apellido as cliente_apellido,
          c.email as cliente_email,
          c.telefono as cliente_telefono,
          c.foto as cliente_foto,
          e.nombre as empleado_nombre,
          e.apellido as empleado_apellido,
          e.puesto as empleado_puesto,
          e.foto as empleado_foto
        FROM pagos_servicios ps
        LEFT JOIN clientes c ON ps.cliente_id = c.id
        LEFT JOIN empleados e ON ps.empleado_id = e.id
        WHERE ps.id = ?
        `,
        [idReal],
      )

      if (pagoServicio && (pagoServicio as any[]).length > 0) {
        transaccion = (pagoServicio as any[])[0]
        transaccion.tipo = "servicio"

        // Obtener servicios del pago
        const servicios = await query(
          `
          SELECT 
            psi.*,
            s.nombre as servicio_nombre,
            s.descripcion as servicio_descripcion,
            s.duracion as servicio_duracion,
            s.categoria as servicio_categoria,
            s.imagen as servicio_imagen
          FROM pago_servicio_items psi
          LEFT JOIN servicios s ON psi.servicio_id = s.id
          WHERE psi.pago_servicio_id = ?
          `,
          [idReal],
        )
        transaccion.servicios = servicios
      }
    } else {
      // Buscar en citas completadas (método anterior para compatibilidad)
      const cita = await query(
        `
        SELECT 
          ci.*,
          c.nombre as cliente_nombre,
          c.apellido as cliente_apellido,
          c.email as cliente_email,
          c.telefono as cliente_telefono,
          c.foto as cliente_foto,
          e.nombre as empleado_nombre,
          e.apellido as empleado_apellido,
          e.puesto as empleado_puesto,
          e.foto as empleado_foto
        FROM citas ci
        LEFT JOIN clientes c ON ci.cliente_id = c.id
        LEFT JOIN empleados e ON ci.empleado_id = e.id
        WHERE ci.id = ? AND ci.estado = 'completada'
        `,
        [idReal],
      )

      if (cita && (cita as any[]).length > 0) {
        transaccion = (cita as any[])[0]
        transaccion.tipo = "servicio"
        transaccion.total = transaccion.precio_total
        transaccion.metodo_pago = "efectivo"

        // Obtener servicios de la cita
        const servicios = await query(
          `
          SELECT 
            cs.*,
            s.nombre as servicio_nombre,
            s.descripcion as servicio_descripcion,
            s.duracion as servicio_duracion,
            s.categoria as servicio_categoria,
            s.imagen as servicio_imagen
          FROM cita_servicios cs
          LEFT JOIN servicios s ON cs.servicio_id = s.id
          WHERE cs.cita_id = ?
          `,
          [idReal],
        )
        transaccion.servicios = servicios
      }
    }

    if (!transaccion) {
      return NextResponse.json(
        {
          success: false,
          error: "Transacción no encontrada",
        },
        { status: 404 },
      )
    }

    console.log("Transacción found:", transaccion.id)

    return NextResponse.json({
      success: true,
      data: transaccion,
    })
  } catch (error) {
    console.error("Error fetching pago:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el pago",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("API Pagos - DELETE request:", id)

    // Determinar si es una venta o un pago de servicio
    let tipo = "servicio"
    let idReal = id

    if (id.startsWith("V-")) {
      tipo = "venta"
      idReal = id.substring(2)
    } else if (id.startsWith("S-")) {
      tipo = "pago_servicio"
      idReal = id.substring(2)
    } else if (id.startsWith("C-")) {
      tipo = "cita"
      idReal = id.substring(2)
    }

    if (tipo === "venta") {
      // Verificar que la venta existe
      const ventaExistente = await query("SELECT id, estado FROM ventas WHERE id = ?", [idReal])

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
      const productos = await query("SELECT producto_id, cantidad FROM venta_productos WHERE venta_id = ?", [idReal])

      for (const producto of productos as any[]) {
        await query("UPDATE productos SET stock = stock + ?, updated_at = NOW() WHERE id = ?", [
          producto.cantidad,
          producto.producto_id,
        ])
      }

      // Eliminar productos de la venta
      await query("DELETE FROM venta_productos WHERE venta_id = ?", [idReal])

      // Eliminar la venta
      await query("DELETE FROM ventas WHERE id = ?", [idReal])

      console.log("Venta deleted successfully:", idReal)
    } else if (tipo === "pago_servicio") {
      // Verificar que el pago de servicio existe
      const pagoExistente = await query("SELECT id, estado, cita_id FROM pagos_servicios WHERE id = ?", [idReal])

      if (!pagoExistente || (pagoExistente as any[]).length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Pago de servicio no encontrado",
          },
          { status: 404 },
        )
      }

      const pago = (pagoExistente as any[])[0]

      // Eliminar items del pago
      await query("DELETE FROM pago_servicio_items WHERE pago_servicio_id = ?", [idReal])

      // Eliminar el pago
      await query("DELETE FROM pagos_servicios WHERE id = ?", [idReal])

      // Si había una cita asociada, cambiar su estado a programada
      if (pago.cita_id) {
        await query("UPDATE citas SET estado = 'programada', updated_at = NOW() WHERE id = ?", [pago.cita_id])
      }

      console.log("Pago de servicio deleted successfully:", idReal)
    } else {
      // Para citas, cambiar estado a cancelada en lugar de eliminar
      const citaExistente = await query("SELECT id, estado FROM citas WHERE id = ?", [idReal])

      if (!citaExistente || (citaExistente as any[]).length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Cita no encontrada",
          },
          { status: 404 },
        )
      }

      // Cambiar estado a cancelada
      await query("UPDATE citas SET estado = 'cancelada', updated_at = NOW() WHERE id = ?", [idReal])

      console.log("Cita cancelled successfully:", idReal)
    }

    return NextResponse.json({
      success: true,
      message: `${tipo === "venta" ? "Venta eliminada" : tipo === "pago_servicio" ? "Pago de servicio eliminado" : "Servicio cancelado"} exitosamente`,
    })
  } catch (error) {
    console.error("Error deleting pago:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar la transacción",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
