import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// Función para generar ID único
function generateProductId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `prod-${timestamp}-${randomStr}`
}

// GET - Obtener todos los productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const categoria = searchParams.get("categoria")
    const genero = searchParams.get("genero")
    const estado = searchParams.get("estado")
    const bajoStock = searchParams.get("bajoStock")

    let sql = `
      SELECT 
        p.*,
        pr.nombre as proveedor_nombre,
        pr.contacto as proveedor_contacto,
        pr.telefono as proveedor_telefono,
        pr.email as proveedor_email
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE 1=1
    `
    const params: any[] = []

    if (search) {
      sql += ` AND (
        p.nombre LIKE ? OR 
        p.descripcion LIKE ? OR 
        p.codigo LIKE ? OR 
        p.marca LIKE ? OR
        p.categoria LIKE ?
      )`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    if (categoria && categoria !== "todas") {
      sql += ` AND p.categoria = ?`
      params.push(categoria)
    }

    if (genero && genero !== "todos") {
      sql += ` AND p.genero = ?`
      params.push(genero)
    }

    if (estado && estado !== "todos") {
      sql += ` AND p.estado = ?`
      params.push(estado)
    }

    if (bajoStock === "true") {
      sql += ` AND p.stock <= p.stock_minimo`
    }

    sql += ` ORDER BY p.created_at DESC`

    const productos = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: productos,
      total: Array.isArray(productos) ? productos.length : 0,
    })
  } catch (error) {
    console.error("Error fetching productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los productos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validaciones básicas
    if (
      !body.nombre ||
      body.precio === undefined ||
      body.precio_compra === undefined ||
      !body.categoria ||
      !body.genero ||
      !body.marca ||
      !body.proveedor_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos obligatorios",
          details: "Nombre, precio, precio_compra, categoría, género, marca y proveedor son obligatorios",
        },
        { status: 400 },
      )
    }

    // Validar que los precios sean números válidos
    const precio = Number(body.precio)
    const precioCompra = Number(body.precio_compra)

    if (isNaN(precio) || precio < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio de venta debe ser un número válido mayor o igual a 0",
        },
        { status: 400 },
      )
    }

    if (isNaN(precioCompra) || precioCompra < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El precio de compra debe ser un número válido mayor o igual a 0",
        },
        { status: 400 },
      )
    }

    // Verificar que el proveedor existe
    const proveedorExists = await query("SELECT id FROM proveedores WHERE id = ? AND estado = 'activo'", [
      body.proveedor_id,
    ])

    if (!Array.isArray(proveedorExists) || proveedorExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El proveedor seleccionado no existe o está inactivo",
        },
        { status: 400 },
      )
    }

    // Verificar que el código no esté duplicado (si se proporciona)
    if (body.codigo) {
      const codigoExists = await query("SELECT id FROM productos WHERE codigo = ?", [body.codigo])

      if (Array.isArray(codigoExists) && codigoExists.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un producto con este código",
          },
          { status: 400 },
        )
      }
    }

    // Generar ID automático
    const id = generateProductId()
    const fechaCreacion = new Date().toISOString().split("T")[0]

    const sql = `
      INSERT INTO productos (
        id, codigo, nombre, descripcion, precio, precio_compra, 
        stock, stock_minimo, categoria, genero, marca, proveedor_id,
        imagen, destacado, estado, fecha_creacion, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const params = [
      id,
      body.codigo || null,
      body.nombre,
      body.descripcion || null,
      precio,
      precioCompra,
      Number.parseInt(body.stock) || 0,
      Number.parseInt(body.stock_minimo) || 0,
      body.categoria,
      body.genero,
      body.marca,
      body.proveedor_id,
      body.imagen || null,
      body.destacado ? 1 : 0,
      body.estado || "activo",
      fechaCreacion,
    ]

    await query(sql, params)

    // Obtener el producto creado con información del proveedor
    const nuevoProducto = await query(
      `
      SELECT 
        p.*,
        pr.nombre as proveedor_nombre
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.id = ?
    `,
      [id],
    )

    return NextResponse.json({
      success: true,
      data: Array.isArray(nuevoProducto) ? nuevoProducto[0] : nuevoProducto,
      message: "Producto creado exitosamente",
    })
  } catch (error) {
    console.error("Error creating producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el producto",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
