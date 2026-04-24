import type { Metadata } from "next"
import ServicioForm from "@/components/dashboard/servicios/servicio-form"

export const metadata: Metadata = {
  title: "Editar Servicio | Click Barber Shop",
  description: "Editar información de un servicio",
}

interface EditarServicioPageProps {
  params: {
    id: string
  }
}

export default function EditarServicioPage({ params }: EditarServicioPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Servicio</h1>
        <p className="text-muted-foreground">Actualiza la información del servicio</p>
      </div>
      <div className="border rounded-lg p-6">
        <ServicioForm servicioId={params.id} isEditing={true} />
      </div>
    </div>
  )
}
