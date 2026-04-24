import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("API Dashboard Stats - GET request")

    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0]
    const finMes = hoy.toISOString().split("T")[0]
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1).toISOString().split("T")[0]
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split("T")[0]
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split("T")[0]

    // 1. Estadísticas generales
    const [
      totalClientes,
      totalEmpleados,
      totalServicios,
      totalProductos,
      citasHoy,
      citasMes,
      citasMesAnterior,
      ingresosServiciosHoy,
      ingresosServiciosMes,
      ingresosServiciosMesAnterior,
      ingresosVentasHoy,
      ingresosVentasMes,
      ingresosVentasMesAnterior,
      productosStock,
      clientesNuevosMes,
      clientesNuevosMesAnterior,
    ] = await Promise.all([
      // Total clientes
      query("SELECT COUNT(*) as total FROM clientes WHERE id != 'cliente-anonimo'"),

      // Total empleados activos
      query("SELECT COUNT(*) as total FROM empleados WHERE estado = 'activo'"),

      // Total servicios activos
      query("SELECT COUNT(*) as total FROM servicios WHERE estado = 'activo'"),

      // Total productos activos
      query("SELECT COUNT(*) as total FROM productos WHERE estado = 'activo'"),

      // Citas de hoy
      query("SELECT COUNT(*) as total FROM citas WHERE DATE(fecha) = CURDATE() AND estado != 'cancelada'"),

      // Citas del mes
      query(
        "SELECT COUNT(*) as total FROM citas WHERE DATE(fecha) >= ? AND DATE(fecha) <= ? AND estado != 'cancelada'",
        [inicioMes, finMes],
      ),

      // Citas del mes anterior
      query(
        "SELECT COUNT(*) as total FROM citas WHERE DATE(fecha) >= ? AND DATE(fecha) <= ? AND estado != 'cancelada'",
        [mesAnterior, finMesAnterior],
      ),

      // Ingresos por servicios hoy
      query(
        "SELECT COALESCE(SUM(precio_total), 0) as total FROM citas WHERE estado = 'completada' AND DATE(fecha) = CURDATE()",
      ),

      // Ingresos por servicios este mes
      query(
        "SELECT COALESCE(SUM(precio_total), 0) as total FROM citas WHERE estado = 'completada' AND DATE(fecha) >= ? AND DATE(fecha) <= ?",
        [inicioMes, finMes],
      ),

      // Ingresos por servicios mes anterior
      query(
        "SELECT COALESCE(SUM(precio_total), 0) as total FROM citas WHERE estado = 'completada' AND DATE(fecha) >= ? AND DATE(fecha) <= ?",
        [mesAnterior, finMesAnterior],
      ),

      // Ventas hoy
      query(
        "SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE estado = 'completada' AND DATE(fecha) = CURDATE()",
      ),

      // Ventas este mes
      query(
        "SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE estado = 'completada' AND DATE(fecha) >= ? AND DATE(fecha) <= ?",
        [inicioMes, finMes],
      ),

      // Ventas mes anterior
      query(
        "SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE estado = 'completada' AND DATE(fecha) >= ? AND DATE(fecha) <= ?",
        [mesAnterior, finMesAnterior],
      ),

      // Productos con stock bajo
      query("SELECT COUNT(*) as total FROM productos WHERE stock <= stock_minimo AND estado = 'activo'"),

      // Clientes nuevos este mes
      query(
        "SELECT COUNT(*) as total FROM clientes WHERE DATE(fecha_registro) >= ? AND DATE(fecha_registro) <= ? AND id != 'cliente-anonimo'",
        [inicioMes, finMes],
      ),

      // Clientes nuevos mes anterior
      query(
        "SELECT COUNT(*) as total FROM clientes WHERE DATE(fecha_registro) >= ? AND DATE(fecha_registro) <= ? AND id != 'cliente-anonimo'",
        [mesAnterior, finMesAnterior],
      ),
    ])

    // 2. Próximas citas
    const proximasCitas = await query(
      `
      SELECT 
        c.*,
        CASE 
          WHEN cl.id = 'cliente-anonimo' THEN 'Cliente'
          ELSE cl.nombre 
        END as cliente_nombre,
        CASE 
          WHEN cl.id = 'cliente-anonimo' THEN 'no registrado'
          ELSE cl.apellido 
        END as cliente_apellido,
        cl.email as cliente_email,
        cl.telefono as cliente_telefono,
        cl.foto as cliente_foto,
        e.nombre as empleado_nombre,
        e.apellido as empleado_apellido,
        e.puesto as empleado_puesto,
        e.foto as empleado_foto
      FROM citas c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      LEFT JOIN empleados e ON c.empleado_id = e.id
      WHERE c.estado = 'programada' 
        AND CONCAT(c.fecha, ' ', c.hora_inicio) >= NOW()
      ORDER BY c.fecha ASC, c.hora_inicio ASC
      LIMIT 5
      `,
    )

    // 3. Ventas recientes
    const ventasRecientes = await query(
      `
      SELECT 
        v.*,
        CASE 
          WHEN c.id = 'cliente-anonimo' THEN 'Cliente'
          ELSE c.nombre 
        END as cliente_nombre,
        CASE 
          WHEN c.id = 'cliente-anonimo' THEN 'no registrado'
          ELSE c.apellido 
        END as cliente_apellido,
        e.nombre as empleado_nombre,
        e.apellido as empleado_apellido
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN empleados e ON v.empleado_id = e.id
      WHERE v.estado = 'completada'
      ORDER BY v.fecha DESC
      LIMIT 5
      `,
    )

    // 4. Productos más vendidos este mes
    const topProductos = await query(
      `
      SELECT 
        p.id,
        p.nombre,
        p.categoria,
        p.precio,
        SUM(vp.cantidad) as cantidad_vendida,
        SUM(vp.subtotal) as total_ventas
      FROM venta_productos vp
      INNER JOIN productos p ON vp.producto_id = p.id
      INNER JOIN ventas v ON vp.venta_id = v.id
      WHERE v.estado = 'completada' 
        AND DATE(v.fecha) >= ? 
        AND DATE(v.fecha) <= ?
      GROUP BY p.id, p.nombre, p.categoria, p.precio
      ORDER BY cantidad_vendida DESC
      LIMIT 5
      `,
      [inicioMes, finMes],
    )

    // 5. Servicios más solicitados este mes
    const topServicios = await query(
      `
      SELECT 
        s.id,
        s.nombre,
        s.categoria,
        s.precio,
        COUNT(cs.servicio_id) as cantidad_solicitada,
        SUM(cs.precio) as total_ingresos
      FROM cita_servicios cs
      INNER JOIN servicios s ON cs.servicio_id = s.id
      INNER JOIN citas c ON cs.cita_id = c.id
      WHERE c.estado = 'completada' 
        AND DATE(c.fecha) >= ? 
        AND DATE(c.fecha) <= ?
      GROUP BY s.id, s.nombre, s.categoria, s.precio
      ORDER BY cantidad_solicitada DESC
      LIMIT 5
      `,
      [inicioMes, finMes],
    )

    // 6. Rendimiento de empleados este mes
    const rendimientoEmpleados = await query(
      `
      SELECT 
        e.id,
        e.nombre,
        e.apellido,
        e.puesto,
        e.foto,
        COUNT(DISTINCT c.id) as total_citas,
        COUNT(DISTINCT v.id) as total_ventas,
        COALESCE(SUM(c.precio_total), 0) as ingresos_servicios,
        COALESCE(SUM(v.total), 0) as ingresos_ventas,
        (COALESCE(SUM(c.precio_total), 0) + COALESCE(SUM(v.total), 0)) as total_generado
      FROM empleados e
      LEFT JOIN citas c ON e.id = c.empleado_id AND c.estado = 'completada' 
        AND DATE(c.fecha) >= ? AND DATE(c.fecha) <= ?
      LEFT JOIN ventas v ON e.id = v.empleado_id AND v.estado = 'completada' 
        AND DATE(v.fecha) >= ? AND DATE(v.fecha) <= ?
      WHERE e.estado = 'activo'
      GROUP BY e.id, e.nombre, e.apellido, e.puesto, e.foto
      ORDER BY total_generado DESC
      LIMIT 5
      `,
      [inicioMes, finMes, inicioMes, finMes],
    )

    // 7. Evolución de ingresos por día (últimos 7 días)
    const evolucionIngresos = await query(
      `
      SELECT 
        DATE(fecha) as fecha,
        'servicio' as tipo,
        SUM(precio_total) as total
      FROM citas 
      WHERE estado = 'completada' 
        AND DATE(fecha) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha)
      
      UNION ALL
      
      SELECT 
        DATE(fecha) as fecha,
        'venta' as tipo,
        SUM(total) as total
      FROM ventas 
      WHERE estado = 'completada' 
        AND DATE(fecha) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha)
      
      ORDER BY fecha DESC
      `,
    )

    // Calcular porcentajes de cambio
    const calcularCambio = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0
      return ((actual - anterior) / anterior) * 100
    }

    const citasActuales = (citasMes as any[])[0]?.total || 0
    const citasAnteriores = (citasMesAnterior as any[])[0]?.total || 0
    const cambioCitas = calcularCambio(citasActuales, citasAnteriores)

    const ingresosServiciosActuales = Number((ingresosServiciosMes as any[])[0]?.total || 0)
    const ingresosServiciosAnteriores = Number((ingresosServiciosMesAnterior as any[])[0]?.total || 0)
    const cambioIngresosServicios = calcularCambio(ingresosServiciosActuales, ingresosServiciosAnteriores)

    const ingresosVentasActuales = Number((ingresosVentasMes as any[])[0]?.total || 0)
    const ingresosVentasAnteriores = Number((ingresosVentasMesAnterior as any[])[0]?.total || 0)
    const cambioIngresosVentas = calcularCambio(ingresosVentasActuales, ingresosVentasAnteriores)

    const clientesActuales = (clientesNuevosMes as any[])[0]?.total || 0
    const clientesAnteriores = (clientesNuevosMesAnterior as any[])[0]?.total || 0
    const cambioClientes = calcularCambio(clientesActuales, clientesAnteriores)

    const stats = {
      resumen: {
        totalClientes: (totalClientes as any[])[0]?.total || 0,
        totalEmpleados: (totalEmpleados as any[])[0]?.total || 0,
        totalServicios: (totalServicios as any[])[0]?.total || 0,
        totalProductos: (totalProductos as any[])[0]?.total || 0,
        productosStockBajo: (productosStock as any[])[0]?.total || 0,
      },
      citas: {
        hoy: (citasHoy as any[])[0]?.total || 0,
        mes: citasActuales,
        cambioMes: cambioCitas,
        proximas: proximasCitas,
      },
      ingresos: {
        serviciosHoy: Number((ingresosServiciosHoy as any[])[0]?.total || 0),
        serviciosMes: ingresosServiciosActuales,
        cambioServiciosMes: cambioIngresosServicios,
        ventasHoy: Number((ingresosVentasHoy as any[])[0]?.total || 0),
        ventasMes: ingresosVentasActuales,
        cambioVentasMes: cambioIngresosVentas,
        totalHoy:
          Number((ingresosServiciosHoy as any[])[0]?.total || 0) + Number((ingresosVentasHoy as any[])[0]?.total || 0),
        totalMes: ingresosServiciosActuales + ingresosVentasActuales,
        cambioTotalMes: calcularCambio(
          ingresosServiciosActuales + ingresosVentasActuales,
          ingresosServiciosAnteriores + ingresosVentasAnteriores,
        ),
      },
      clientes: {
        nuevosMes: clientesActuales,
        cambioMes: cambioClientes,
      },
      actividad: {
        ventasRecientes: ventasRecientes,
        topProductos: topProductos,
        topServicios: topServicios,
        rendimientoEmpleados: rendimientoEmpleados,
        evolucionIngresos: evolucionIngresos,
      },
    }

    console.log("Dashboard stats generated:", stats)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error generating dashboard stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar las estadísticas del dashboard",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
