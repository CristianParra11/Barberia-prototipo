import { Suspense } from "react"
import { notFound } from "next/navigation"
import ProductoDetalle from "@/components/dashboard/inventario/producto-detalle"

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

export default async function ProductoDetallePage({ params }: { params: { id: string } }) {
  const producto = await getProducto(params.id)

  if (!producto) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3b5d]"></div>
        </div>
      }
    >
      <ProductoDetalle producto={producto} />
    </Suspense>
  )
}
