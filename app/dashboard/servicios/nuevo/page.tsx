import type { Metadata } from "next"
import ServicioForm from "@/components/dashboard/servicios/servicio-form"

export const metadata: Metadata = {
  title: "Nuevo Servicio | Click Barber Shop",
  description: "Registrar un nuevo servicio",
}

export default function NuevoServicioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Servicio</h1>
        <p className="text-muted-foreground">Registra un nuevo servicio para tu barbería</p>
      </div>
      <div className="border rounded-lg p-6">
        <ServicioForm />
      </div>
    </div>
  )
}
