import ProveedorForm from "@/components/dashboard/inventario/proveedor-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevoProveedorPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Nuevo Proveedor</h1>
          <p className="text-gray-600">Registra un nuevo proveedor en el sistema</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/proveedores">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a proveedores
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <ProveedorForm />
      </div>
    </div>
  )
}
