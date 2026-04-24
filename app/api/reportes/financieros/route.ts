import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get("periodo") || "mes"
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    console.log("API Reportes Financieros - GET request:", { periodo, fechaInicio, fechaFin })

    // Calcular fechas según el período
    const hoy = new Date()
    let inicioConsulta: string
    let finConsulta: string

    if (fechaInicio && fechaFin) {
      inicioConsulta = fechaInicio
      finConsulta = fechaFin
    } else {
      switch (periodo) {
        case "mes":
          inicioConsulta = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0]
          finConsulta = hoy.toISOString().split("T")[0]
          break
        case "mes-anterior":
          const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
          inicioConsulta = mesAnterior.toISOString().split("T")[0]
          finConsulta = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split("T")[0]
          break
        case "anio":
          inicioConsulta = new Date(hoy.getFullYear(), 0, 1).toISOString().split("T")[0]
          finConsulta = hoy.toISOString().split("T")[0]
          break
        case "anio-anterior":
          inicioConsulta = new Date(hoy.getFullYear() - 1, 0, 1).toISOString().split("T")[0]
          finConsulta = new Date(hoy.getFullYear() - 1, 11, 31).toISOString().split("T")[0]
          break
        default:
          inicioConsulta = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0]
          finConsulta = hoy.toISOString().split("T")[0]
      }
    }

    console.log("Fechas de consulta:", { inicioConsulta, finConsulta })

    // 1. INGRESOS POR SERVICIOS (citas completadas)
    const ingresosServicios = await query(
      `
      SELECT 
        COALESCE(SUM(precio_total), 0) as total,
        COUNT(*) as cantidad
      FROM citas 
      WHERE estado = 'completada' 
        AND DATE(fecha) >= ? 
        AND DATE(fecha) <= ?
      `,
      [inicioConsulta, finConsulta],
    )

    // 2. INGRESOS POR VENTAS
    const ingresosVentas = await query(
      `
      SELECT 
        COALESCE(SUM(total), 0) as total,
        COUNT(*) as cantidad
      FROM ventas 
      WHERE estado = 'completada' 
        AND DATE(fecha) >= ? 
        AND DATE(fecha) <= ?
      `,
      [inicioConsulta, finConsulta],
    )

    // 3. TOP SERVICIOS
    const topServicios = await query(
      `
      SELECT 
        s.id,
        s.nombre,
        s.precio,
        s.categoria,
        s.imagen,
        COUNT(cs.servicio_id) as cantidad,
        SUM(cs.precio) as total_ingresos
      FROM cita_servicios cs
      INNER JOIN servicios s ON cs.servicio_id = s.id
      INNER JOIN citas c ON cs.cita_id = c.id
      WHERE c.estado = 'completada' 
        AND DATE(c.fecha) >= ? 
        AND DATE(c.fecha) <= ?
      GROUP BY s.id, s.nombre, s.precio, s.categoria, s.imagen
      ORDER BY total_ingresos DESC
      LIMIT 10
      `,
      [inicioConsulta, finConsulta],
    )

    // 4. TOP PRODUCTOS
    const topProductos = await query(
      `
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.categoria,
        p.imagen,
        SUM(vp.cantidad) as cantidad,
        SUM(vp.subtotal) as total_ingresos
      FROM venta_productos vp
      INNER JOIN productos p ON vp.producto_id = p.id
      INNER JOIN ventas v ON vp.venta_id = v.id
      WHERE v.estado = 'completada' 
        AND DATE(v.fecha) >= ? 
        AND DATE(v.fecha) <= ?
      GROUP BY p.id, p.nombre, p.precio, p.categoria, p.imagen
      ORDER BY total_ingresos DESC
      LIMIT 10
      `,
      [inicioConsulta, finConsulta],
    )

    // 5. TOP CLIENTES
    const topClientes = await query(
      `
      SELECT 
        c.id,
        c.nombre,
        c.apellido,
        c.email,
        c.telefono,
        c.foto,
        COALESCE(servicios.cantidad, 0) as servicios,
        COALESCE(ventas.cantidad, 0) as ventas,
        COALESCE(servicios.total, 0) + COALESCE(ventas.total, 0) as total_gastado
      FROM clientes c
      LEFT JOIN (
        SELECT 
          cliente_id,
          COUNT(*) as cantidad,
          SUM(precio_total) as total
        FROM citas 
        WHERE estado = 'completada' 
          AND DATE(fecha) >= ? 
          AND DATE(fecha) <= ?
        GROUP BY cliente_id
      ) servicios ON c.id = servicios.cliente_id
      LEFT JOIN (
        SELECT 
          cliente_id,
          COUNT(*) as cantidad,
          SUM(total) as total
        FROM ventas 
        WHERE estado = 'completada' 
          AND DATE(fecha) >= ? 
          AND DATE(fecha) <= ?
        GROUP BY cliente_id
      ) ventas ON c.id = ventas.cliente_id
      WHERE (servicios.cantidad > 0 OR ventas.cantidad > 0)
      ORDER BY total_gastado DESC
      LIMIT 10
      `,
      [inicioConsulta, finConsulta, inicioConsulta, finConsulta],
    )

    // 6. TOP EMPLEADOS
    const topEmpleados = await query(
      `
      SELECT 
        e.id,
        e.nombre,
        e.apellido,
        e.puesto,
        e.foto,
        COALESCE(servicios.cantidad, 0) as servicios,
        COALESCE(ventas.cantidad, 0) as ventas,
        COALESCE(servicios.total, 0) + COALESCE(ventas.total, 0) as total_generado
      FROM empleados e
      LEFT JOIN (
        SELECT 
          empleado_id,
          COUNT(*) as cantidad,
          SUM(precio_total) as total
        FROM citas 
        WHERE estado = 'completada' 
          AND DATE(fecha) >= ? 
          AND DATE(fecha) <= ?
        GROUP BY empleado_id
      ) servicios ON e.id = servicios.empleado_id
      LEFT JOIN (
        SELECT 
          empleado_id,
          COUNT(*) as cantidad,
          SUM(total) as total
        FROM ventas 
        WHERE estado = 'completada' 
          AND DATE(fecha) >= ? 
          AND DATE(fecha) <= ?
        GROUP BY empleado_id
      ) ventas ON e.id = ventas.empleado_id
      WHERE e.estado = 'activo' AND (servicios.cantidad > 0 OR ventas.cantidad > 0)
      ORDER BY total_generado DESC
      LIMIT 10
      `,
      [inicioConsulta, finConsulta, inicioConsulta, finConsulta],
    )

    // 7. EVOLUCIÓN MENSUAL (últimos 12 meses)
    const evolucionMensual = await query(
      `
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        'servicio' as tipo,
        SUM(precio_total) as total
      FROM citas 
      WHERE estado = 'completada' 
        AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      
      UNION ALL
      
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        'venta' as tipo,
        SUM(total) as total
      FROM ventas 
      WHERE estado = 'completada' 
        AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      
      ORDER BY mes DESC
      `,
    )

    // 8. MÉTODOS DE PAGO
    const metodosPago = await query(
      `
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        SUM(total) as total
      FROM ventas 
      WHERE estado = 'completada' 
        AND DATE(fecha) >= ? 
        AND DATE(fecha) <= ?
      GROUP BY metodo_pago
      ORDER BY total DESC
      `,
      [inicioConsulta, finConsulta],
    )

    const resultado = {
      periodo: {
        inicio: inicioConsulta,
        fin: finConsulta,
        nombre: periodo,
      },
      ingresos: {
        servicios: {
          total: Number((ingresosServicios as any[])[0]?.total || 0),
          cantidad: Number((ingresosServicios as any[])[0]?.cantidad || 0),
        },
        ventas: {
          total: Number((ingresosVentas as any[])[0]?.total || 0),
          cantidad: Number((ingresosVentas as any[])[0]?.cantidad || 0),
        },
        total: Number((ingresosServicios as any[])[0]?.total || 0) + Number((ingresosVentas as any[])[0]?.total || 0),
      },
      topServicios: topServicios,
      topProductos: topProductos,
      topClientes: topClientes,
      topEmpleados: topEmpleados,
      evolucionMensual: evolucionMensual,
      metodosPago: metodosPago,
    }

    console.log("Reporte generado:", resultado)

    return NextResponse.json({
      success: true,
      data: resultado,
    })
  } catch (error) {
    console.error("Error generating financial report:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar el reporte financiero",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
