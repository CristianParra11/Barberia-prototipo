import type { Metadata } from "next"
import RegistroPagoForm from "@/components/dashboard/pagos/registro-pago-form"

export const metadata: Metadata = {
  title: "Registrar Pago | Click Barber",
  description: "Registrar un nuevo pago en el sistema de Click Barber",
}

export default function NuevoPagoPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Registrar Pago</h2>
        </div>
        <RegistroPagoForm />
      </div>
    </div>
  )
}
