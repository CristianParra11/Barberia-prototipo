import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    console.log("API Ventas - GET request:", { search })

    let sql = `
      SELECT 
        v.*,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.email as cliente_email,
        c.telefono as cliente_telefono,
        e.nombre as empleado_nombre,
        e.apellido as empleado_apellido,
        e.puesto as empleado_puesto
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN empleados e ON v.empleado_id = e.id
    `

    const params: any[] = []

    if (search) {
      sql += ` WHERE (
        v.id LIKE ? OR
        c.nombre LIKE ? OR
        c.apellido LIKE ? OR
        e.nombre LIKE ? OR
        e.apellido LIKE ? OR
        v.total LIKE ?
      )`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    sql += ` ORDER BY v.fecha DESC`

    console.log("Executing SQL:", sql)
    console.log("With params:", params)

    const ventas = await query(sql, params)

    // Obtener productos para cada venta
    for (const venta of ventas as any[]) {
      const productos = await query(
        `
        SELECT 
          vp.*,
          p.nombre as producto_nombre,
          p.codigo as producto_codigo,
          p.categoria as producto_categoria,
          p.imagen as producto_imagen
        FROM venta_productos vp
        LEFT JOIN productos p ON vp.producto_id = p.id
        WHERE vp.venta_id = ?
        `,
        [venta.id],
      )
      venta.productos = productos
    }

    console.log("Ventas found:", (ventas as any[]).length)

    return NextResponse.json({
      success: true,
      data: ventas,
      total: (ventas as any[]).length,
    })
  } catch (error) {
    console.error("Error fetching ventas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener las ventas",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API Ventas - POST request:", body)

    const { cliente_id, empleado_id, productos, metodo_pago, descuento = 0, notas = "" } = body

    // Validaciones
    if (!empleado_id) {
      return NextResponse.json(
        {
          success: false,
          error: "El empleado es obligatorio",
        },
        { status: 400 },
      )
    }

    if (!productos || productos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe seleccionar al menos un producto",
        },
        { status: 400 },
      )
    }

    if (!metodo_pago) {
      return NextResponse.json(
        {
          success: false,
          error: "El método de pago es obligatorio",
        },
        { status: 400 },
      )
    }

    // Verificar que el empleado existe y está activo
    const empleado = await query("SELECT id, estado FROM empleados WHERE id = ?", [empleado_id])

    if (!empleado || (empleado as any[]).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El empleado seleccionado no existe",
        },
        { status: 400 },
      )
    }

    if ((empleado as any[])[0].estado !== "activo") {
      return NextResponse.json(
        {
          success: false,
          error: "El empleado seleccionado no está activo",
        },
        { status: 400 },
      )
    }

    // Verificar cliente si se proporciona
    if (cliente_id && cliente_id !== "no-registrado") {
      const cliente = await query("SELECT id FROM clientes WHERE id = ?", [cliente_id])

      if (!cliente || (cliente as any[]).length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "El cliente seleccionado no existe",
          },
          { status: 400 },
        )
      }
    }

    // Calcular total
    let total = 0
    for (const producto of productos) {
      if (!producto.producto_id || !producto.cantidad || !producto.precio_unitario) {
        return NextResponse.json(
          {
            success: false,
            error: "Datos de producto incompletos",
          },
          { status: 400 },
        )
      }

      // Verificar que el producto existe y tiene stock suficiente
      const productoDb = await query("SELECT id, stock, precio FROM productos WHERE id = ? AND estado = 'activo'", [
        producto.producto_id,
      ])

      if (!productoDb || (productoDb as any[]).length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `El producto ${producto.producto_id} no existe o no está activo`,
          },
          { status: 400 },
        )
      }

      const stockDisponible = (productoDb as any[])[0].stock
      if (stockDisponible < producto.cantidad) {
        return NextResponse.json(
          {
            success: false,
            error: `Stock insuficiente para el producto ${producto.producto_id}. Disponible: ${stockDisponible}`,
          },
          { status: 400 },
        )
      }

      total += producto.cantidad * producto.precio_unitario
    }

    // Aplicar descuento
    const totalConDescuento = total * (1 - descuento / 100)

    // Generar ID único
    const ventaId = `venta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Crear la venta
    await query(
      `INSERT INTO ventas (
        id, fecha, cliente_id, empleado_id, total, metodo_pago, 
        estado, descuento, notas, created_at, updated_at
      ) VALUES (?, NOW(), ?, ?, ?, ?, 'completada', ?, ?, NOW(), NOW())`,
      [
        ventaId,
        cliente_id === "no-registrado" ? null : cliente_id,
        empleado_id,
        totalConDescuento,
        metodo_pago,
        descuento,
        notas,
      ],
    )

    // Insertar productos de la venta y actualizar stock
    for (const producto of productos) {
      const subtotal = producto.cantidad * producto.precio_unitario

      // Insertar producto de venta
      await query(
        `INSERT INTO venta_productos (
          venta_id, producto_id, cantidad, precio_unitario, subtotal, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [ventaId, producto.producto_id, producto.cantidad, producto.precio_unitario, subtotal],
      )

      // Actualizar stock del producto
      await query("UPDATE productos SET stock = stock - ?, updated_at = NOW() WHERE id = ?", [
        producto.cantidad,
        producto.producto_id,
      ])
    }

    // Obtener la venta creada con datos relacionados
    const ventaCreada = await query(
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
      [ventaId],
    )

    console.log("Venta created successfully:", ventaId)

    return NextResponse.json({
      success: true,
      data: (ventaCreada as any[])[0],
      message: "Venta registrada exitosamente",
    })
  } catch (error) {
    console.error("Error creating venta:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear la venta",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
