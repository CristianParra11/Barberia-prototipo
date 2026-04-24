import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// GET - Obtener producto por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const sql = `
      SELECT 
        p.*,
        pr.nombre as proveedor_nombre,
        pr.contacto as proveedor_contacto,
        pr.telefono as proveedor_telefono,
        pr.email as proveedor_email
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.id = ?
    `

    const resultado = await query(sql, [id])

    if (!Array.isArray(resultado) || resultado.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: resultado[0],
    })
  } catch (error) {
    console.error("Error fetching producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el producto",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Verificar que el producto existe
    const productoExists = await query("SELECT id FROM productos WHERE id = ?", [id])

    if (!Array.isArray(productoExists) || productoExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 },
      )
    }

    // Verificar que el proveedor existe (si se está actualizando)
    if (body.proveedor_id) {
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
    }

    // Verificar código duplicado (si se está actualizando y es diferente)
    if (body.codigo) {
      const codigoExists = await query("SELECT id FROM productos WHERE codigo = ? AND id != ?", [body.codigo, id])

      if (Array.isArray(codigoExists) && codigoExists.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe otro producto con este código",
          },
          { status: 400 },
        )
      }
    }

    // Construir la consulta de actualización dinámicamente
    const updateFields = []
    const updateValues = []

    const allowedFields = [
      "codigo",
      "nombre",
      "descripcion",
      "precio",
      "precio_compra",
      "stock",
      "stock_minimo",
      "categoria",
      "genero",
      "marca",
      "proveedor_id",
      "imagen",
      "destacado",
      "estado",
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`)

        if (field === "precio" || field === "precio_compra") {
          const value = Number(body[field])
          if (isNaN(value) || value < 0) {
            return NextResponse.json(
              {
                success: false,
                error: `El ${field.replace("_", " ")} debe ser un número válido mayor o igual a 0`,
              },
              { status: 400 },
            )
          }
          updateValues.push(value)
        } else if (field === "stock" || field === "stock_minimo") {
          const value = Number.parseInt(body[field])
          if (isNaN(value) || value < 0) {
            return NextResponse.json(
              {
                success: false,
                error: `El ${field.replace("_", " ")} debe ser un número entero mayor o igual a 0`,
              },
              { status: 400 },
            )
          }
          updateValues.push(value)
        } else if (field === "destacado") {
          updateValues.push(body[field] ? 1 : 0)
        } else {
          updateValues.push(body[field])
        }
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay campos para actualizar",
        },
        { status: 400 },
      )
    }

    // Agregar updated_at
    updateFields.push("updated_at = NOW()")
    updateValues.push(id)

    const sql = `UPDATE productos SET ${updateFields.join(", ")} WHERE id = ?`
    await query(sql, updateValues)

    // Obtener el producto actualizado
    const productoActualizado = await query(
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
      data: Array.isArray(productoActualizado) ? productoActualizado[0] : productoActualizado,
      message: "Producto actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el producto",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verificar que el producto existe
    const productoExists = await query("SELECT id, nombre FROM productos WHERE id = ?", [id])

    if (!Array.isArray(productoExists) || productoExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 },
      )
    }

    // Verificar si el producto está siendo usado en ventas o citas
    const ventasConProducto = await query(
      `
      SELECT COUNT(*) as count 
      FROM venta_productos vp
      INNER JOIN ventas v ON vp.venta_id = v.id
      WHERE vp.producto_id = ?
    `,
      [id],
    )

    const citasConProducto = await query(
      `
      SELECT COUNT(*) as count 
      FROM cita_productos cp
      INNER JOIN citas c ON cp.cita_id = c.id
      WHERE cp.producto_id = ?
    `,
      [id],
    )

    const tieneVentas = Array.isArray(ventasConProducto) && ventasConProducto[0]?.count > 0
    const tieneCitas = Array.isArray(citasConProducto) && citasConProducto[0]?.count > 0

    if (tieneVentas || tieneCitas) {
      // Si tiene ventas o citas asociadas, solo cambiar estado a inactivo
      await query("UPDATE productos SET estado = 'inactivo', updated_at = NOW() WHERE id = ?", [id])

      return NextResponse.json({
        success: true,
        message: "Producto desactivado (tiene ventas o citas asociadas)",
        action: "deactivated",
      })
    } else {
      // Si no tiene relaciones, eliminar completamente
      await query("DELETE FROM productos WHERE id = ?", [id])

      return NextResponse.json({
        success: true,
        message: "Producto eliminado exitosamente",
        action: "deleted",
      })
    }
  } catch (error) {
    console.error("Error deleting producto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar el producto",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
