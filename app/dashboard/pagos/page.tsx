import type { Metadata } from "next"
import PagosLista from "@/components/dashboard/pagos/pagos-lista"

export const metadata: Metadata = {
  title: "Gestión de Pagos | Click Barber",
  description: "Sistema de gestión de pagos y facturación para Click Barber",
}

export default function PagosPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Pagos</h2>
        </div>
        <PagosLista />
      </div>
    </div>
  )
}
