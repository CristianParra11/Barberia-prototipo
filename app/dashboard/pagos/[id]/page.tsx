import type { Metadata } from "next"
import { notFound } from "next/navigation"
import PagoDetalle from "@/components/dashboard/pagos/pago-detalle"

export const metadata: Metadata = {
  title: "Detalles de Pago | Click Barber",
  description: "Ver detalles de un pago en el sistema de Click Barber",
}

interface PagoDetallePageProps {
  params: {
    id: string
  }
}

export default function PagoDetallePage({ params }: PagoDetallePageProps) {
  // En un caso real, aquí verificaríamos si el ID existe
  // Si no existe, redirigimos a 404
  if (!params.id) {
    notFound()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-6">
        <PagoDetalle id={params.id} />
      </div>
    </div>
  )
}
