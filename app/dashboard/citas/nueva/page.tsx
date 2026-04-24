import CitaForm from "@/components/dashboard/citas/cita-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NuevaCitaPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Nueva Cita</h1>
          <p className="text-gray-600">Programa una nueva cita para un cliente</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/citas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a citas
          </Link>
        </Button>
      </div>

      <CitaForm />
    </div>
  )
}
