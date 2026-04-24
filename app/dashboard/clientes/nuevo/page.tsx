import ClienteForm from "@/components/dashboard/clientes/cliente-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevoClientePage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Nuevo Cliente</h1>
          <p className="text-gray-600">Añade un nuevo cliente a la barbería</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a clientes
          </Link>
        </Button>
      </div>

      <ClienteForm />
    </div>
  )
}
