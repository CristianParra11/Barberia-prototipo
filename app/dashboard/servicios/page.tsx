import ServiciosTable from "@/components/dashboard/servicios/servicios-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function ServiciosPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Gestión de Servicios</h1>
          <p className="text-gray-600">Administra los servicios ofrecidos por la barbería</p>
        </div>
        <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
          <Link href="/dashboard/servicios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Link>
        </Button>
      </div>

      <ServiciosTable />
    </div>
  )
}
