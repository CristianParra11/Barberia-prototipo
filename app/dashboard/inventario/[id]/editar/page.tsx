import { Suspense } from "react"
import { notFound } from "next/navigation"
import ProductoForm from "@/components/dashboard/inventario/producto-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getProducto(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/productos/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error fetching producto:", error)
    return null
  }
}

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const producto = await getProducto(params.id)

  if (!producto) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Editar Producto</h1>
          <p className="text-gray-600">Modificar información de {producto.nombre}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/inventario">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a inventario
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3b5d]"></div>
          </div>
        }
      >
        <ProductoForm producto={producto} isEditing={true} />
      </Suspense>
    </div>
  )
}
