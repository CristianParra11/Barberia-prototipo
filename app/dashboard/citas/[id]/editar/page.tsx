import { notFound } from "next/navigation"
import CitaForm from "@/components/dashboard/citas/cita-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: {
    id: string
  }
}

async function getCita(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/citas/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error("Error fetching cita:", error)
    return null
  }
}

export default async function EditarCitaPage({ params }: PageProps) {
  const cita = await getCita(params.id)

  if (!cita) {
    notFound()
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Editar Cita</h1>
          <p className="text-gray-600">Modifica los detalles de la cita</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/citas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a citas
          </Link>
        </Button>
      </div>

      <CitaForm cita={cita} />
    </div>
  )
}
