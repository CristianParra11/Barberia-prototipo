import { notFound } from "next/navigation"
import ServicioDetalle from "@/components/dashboard/servicios/servicio-detalle"

export default function ServicioPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound()
  }

  return <ServicioDetalle servicioId={params.id} />
}
