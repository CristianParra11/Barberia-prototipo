import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const tipo = searchParams.get("tipo") || ""

    console.log("API Pagos - GET request:", { search, tipo })

    let transacciones: any[] = []

    // Obtener ventas
    if (tipo === "" || tipo === "venta") {
      const ventas = await query(
        `
        SELECT 
          CONCAT('V-', v.id) as id,
          'venta' as tipo,
          v.fecha,
          v.cliente_id,
          v.empleado_id,
          v.total,
          v.metodo_pago,
          v.estado,
          v.descuento,
          v.notas,
          CASE 
            WHEN c.id IS NULL THEN 'Cliente'
            ELSE c.nombre 
          END as cliente_nombre,
          CASE 
            WHEN c.id IS NULL THEN 'no registrado'
            ELSE c.apellido 
          END as cliente_apellido,
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
        WHERE (? = '' OR 
               LOWER(CONCAT(COALESCE(c.nombre, 'Cliente'), ' ', COALESCE(c.apellido, 'no registrado'))) LIKE LOWER(?) OR
               LOWER(CONCAT(e.nombre, ' ', e.apellido)) LIKE LOWER(?) OR
               v.id LIKE ?)
        ORDER BY v.fecha DESC
        `,
        [search, `%${search}%`, `%${search}%`, `%${search}%`],
      )
      transacciones = [...transacciones, ...ventas]
    }

    // Obtener pagos de servicios
    if (tipo === "" || tipo === "servicio") {
      const servicios = await query(
        `
        SELECT 
          CONCAT('S-', ps.id) as id,
          'servicio' as tipo,
          ps.fecha,
          ps.cliente_id,
          ps.empleado_id,
          ps.total,
          ps.metodo_pago,
          ps.estado,
          ps.descuento,
          ps.notas,
          ps.cita_id,
          CASE 
            WHEN c.id IS NULL THEN 'Cliente'
            ELSE c.nombre 
          END as cliente_nombre,
          CASE 
            WHEN c.id IS NULL THEN 'no registrado'
            ELSE c.apellido 
          END as cliente_apellido,
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
        WHERE (? = '' OR 
               LOWER(CONCAT(COALESCE(c.nombre, 'Cliente'), ' ', COALESCE(c.apellido, 'no registrado'))) LIKE LOWER(?) OR
               LOWER(CONCAT(e.nombre, ' ', e.apellido)) LIKE LOWER(?) OR
               ps.id LIKE ?)
        ORDER BY ps.fecha DESC
        `,
        [search, `%${search}%`, `%${search}%`, `%${search}%`],
      )
      transacciones = [...transacciones, ...servicios]
    }

    // Ordenar por fecha descendente
    transacciones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    console.log(`Found ${transacciones.length} transacciones`)

    return NextResponse.json({
      success: true,
      data: transacciones,
      total: transacciones.length,
    })
  } catch (error) {
    console.error("Error fetching pagos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los pagos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API Pagos - POST request:", body)

    const { tipo, ...data } = body

    if (tipo === "servicio") {
      // Crear pago de servicio en las nuevas tablas
      const { cliente_id, empleado_id, servicio_ids, metodo_pago, total, descuento, notas, cita_id } = data

      // Generar ID único para el pago de servicio
      const pagoId = `pago-serv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Determinar cliente_id: usar null si no hay cliente
      const clienteIdFinal = cliente_id && cliente_id !== "" && cliente_id !== "no-registrado" ? cliente_id : null

      console.log("Cliente ID final:", clienteIdFinal)

      // Crear el pago de servicio
      await query(
        `INSERT INTO pagos_servicios (id, fecha, cliente_id, empleado_id, cita_id, total, metodo_pago, estado, notas, descuento, created_at, updated_at)
         VALUES (?, NOW(), ?, ?, ?, ?, ?, 'completada', ?, ?, NOW(), NOW())`,
        [
          pagoId,
          clienteIdFinal,
          empleado_id,
          cita_id && cita_id !== "no-cita" ? cita_id : null,
          total,
          metodo_pago,
          notas || "",
          descuento || 0,
        ],
      )

      console.log("Pago de servicio creado exitosamente:", pagoId)

      // Agregar servicios al pago
      for (const servicioId of servicio_ids) {
        const servicio = await query(`SELECT precio FROM servicios WHERE id = ?`, [servicioId])

        if (servicio.length > 0) {
          await query(
            `INSERT INTO pago_servicio_items (pago_servicio_id, servicio_id, precio, created_at)
             VALUES (?, ?, ?, NOW())`,
            [pagoId, servicioId, servicio[0].precio],
          )
        }
      }

      console.log("Servicios agregados al pago")

      // Si hay una cita asociada, actualizar su estado
      if (cita_id && cita_id !== "no-cita") {
        await query(`UPDATE citas SET estado = 'completada', notas = ? WHERE id = ?`, [notas || "", cita_id])
        console.log("Cita actualizada a completada:", cita_id)
      }

      return NextResponse.json({
        success: true,
        message: "Pago de servicio registrado exitosamente",
        data: { id: pagoId, tipo: "servicio" },
      })
    } else if (tipo === "venta") {
      // Crear venta (código existente)
      const { cliente_id, empleado_id, productos, metodo_pago, descuento, notas } = data

      const ventaId = `venta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Determinar cliente_id: usar null si no hay cliente
      const clienteIdFinal = cliente_id && cliente_id !== "" && cliente_id !== "no-registrado" ? cliente_id : null

      // Calcular total
      let total = 0
      for (const producto of productos) {
        total += producto.cantidad * producto.precio_unitario
      }

      // Aplicar descuento
      const totalConDescuento = total * (1 - (descuento || 0) / 100)

      // Crear la venta
      await query(
        `INSERT INTO ventas (id, fecha, cliente_id, empleado_id, total, metodo_pago, estado, descuento, notas, created_at, updated_at)
         VALUES (?, NOW(), ?, ?, ?, ?, 'completada', ?, ?, NOW(), NOW())`,
        [ventaId, clienteIdFinal, empleado_id, totalConDescuento, metodo_pago, descuento || 0, notas || ""],
      )

      // Agregar productos a la venta y actualizar stock
      for (const producto of productos) {
        await query(
          `INSERT INTO venta_productos (venta_id, producto_id, cantidad, precio_unitario, subtotal, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            ventaId,
            producto.producto_id,
            producto.cantidad,
            producto.precio_unitario,
            producto.cantidad * producto.precio_unitario,
          ],
        )

        // Actualizar stock
        await query(`UPDATE productos SET stock = stock - ? WHERE id = ?`, [producto.cantidad, producto.producto_id])
      }

      return NextResponse.json({
        success: true,
        message: "Venta registrada exitosamente",
        data: { id: ventaId, tipo: "venta" },
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Tipo de pago no válido",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Error creating pago:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al registrar el pago",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
