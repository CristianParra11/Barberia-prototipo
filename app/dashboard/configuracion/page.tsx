import type { Metadata } from "next"
import ConfiguracionGeneral from "@/components/dashboard/configuracion/configuracion-general"

export const metadata: Metadata = {
  title: "Configuración | Click Barber",
  description: "Configuración general del sistema Click Barber",
}

export default function ConfiguracionPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        </div>
        <ConfiguracionGeneral />
      </div>
    </div>
  )
}
