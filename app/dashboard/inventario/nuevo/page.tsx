import { Suspense } from "react"
import ProductoForm from "@/components/dashboard/inventario/producto-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevoProductoPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Nuevo Producto</h1>
          <p className="text-gray-600">Registra un nuevo producto en el inventario</p>
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
        <ProductoForm />
      </Suspense>
    </div>
  )
}
