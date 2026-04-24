import type { Metadata } from "next"
import InformesFinancieros from "@/components/dashboard/pagos/informes-financieros"

export const metadata: Metadata = {
  title: "Informes Financieros | Click Barber",
  description: "Informes financieros y estadísticas de Click Barber",
}

export default function InformesPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Informes Financieros</h2>
        </div>
        <InformesFinancieros />
      </div>
    </div>
  )
}
