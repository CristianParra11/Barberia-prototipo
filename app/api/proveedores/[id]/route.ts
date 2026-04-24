import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

// GET - Obtener proveedor por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const sql = `SELECT * FROM proveedores WHERE id = ?`
    const resultado = await query(sql, [id])

    if (!Array.isArray(resultado) || resultado.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Proveedor no encontrado",
        },
        { status: 404 },
      )
    }

    // Obtener productos del proveedor
    const productos = await query(
      `SELECT COUNT(*) as total_productos, 
              SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as productos_activos
       FROM productos WHERE proveedor_id = ?`,
      [id],
    )

    const proveedor = {
      ...resultado[0],
      estadisticas: Array.isArray(productos) ? productos[0] : { total_productos: 0, productos_activos: 0 },
    }

    return NextResponse.json({
      success: true,
      data: proveedor,
    })
  } catch (error) {
    console.error("Error fetching proveedor:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el proveedor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// PUT - Actualizar proveedor
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // Verificar que el proveedor existe
    const proveedorExists = await query("SELECT id FROM proveedores WHERE id = ?", [id])

    if (!Array.isArray(proveedorExists) || proveedorExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Proveedor no encontrado",
        },
        { status: 404 },
      )
    }

    // Verificar email único (si se está actualizando y es diferente)
    if (body.email) {
      const emailExists = await query("SELECT id FROM proveedores WHERE email = ? AND id != ?", [body.email, id])

      if (Array.isArray(emailExists) && emailExists.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe otro proveedor con este email",
          },
          { status: 400 },
        )
      }
    }

    // Construir la consulta de actualización dinámicamente
    const updateFields = []
    const updateValues = []

    const allowedFields = ["nombre", "contacto", "telefono", "email", "direccion", "notas", "estado"]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`)
        updateValues.push(body[field])
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

    updateValues.push(id)

    const sql = `UPDATE proveedores SET ${updateFields.join(", ")} WHERE id = ?`
    await query(sql, updateValues)

    // Obtener el proveedor actualizado
    const proveedorActualizado = await query("SELECT * FROM proveedores WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      data: Array.isArray(proveedorActualizado) ? proveedorActualizado[0] : proveedorActualizado,
      message: "Proveedor actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating proveedor:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el proveedor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// DELETE - Eliminar proveedor
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Verificar que el proveedor existe
    const proveedorExists = await query("SELECT id, nombre FROM proveedores WHERE id = ?", [id])

    if (!Array.isArray(proveedorExists) || proveedorExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Proveedor no encontrado",
        },
        { status: 404 },
      )
    }

    // Verificar si el proveedor tiene productos asociados
    const productosAsociados = await query("SELECT COUNT(*) as count FROM productos WHERE proveedor_id = ?", [id])

    if (Array.isArray(productosAsociados) && productosAsociados[0]?.count > 0) {
      // Si tiene productos asociados, solo cambiar estado a inactivo
      await query("UPDATE proveedores SET estado = 'inactivo' WHERE id = ?", [id])

      return NextResponse.json({
        success: true,
        message: "Proveedor desactivado (tiene productos asociados)",
      })
    } else {
      // Si no tiene productos, eliminar completamente
      await query("DELETE FROM proveedores WHERE id = ?", [id])

      return NextResponse.json({
        success: true,
        message: "Proveedor eliminado exitosamente",
      })
    }
  } catch (error) {
    console.error("Error deleting proveedor:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar el proveedor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
