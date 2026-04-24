import { getPagoById } from "@/lib/data"
import { notFound } from "next/navigation"
import RegistroPagoForm from "@/components/dashboard/pagos/registro-pago-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditarPagoPage({ params }: { params: { id: string } }) {
  const pago = getPagoById(params.id)

  if (!pago) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Editar Pago</h1>
          <p className="text-gray-600">Modificar información del pago #{pago.id}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/pagos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a pagos
          </Link>
        </Button>
      </div>

      <RegistroPagoForm pago={pago} />
    </div>
  )
}
