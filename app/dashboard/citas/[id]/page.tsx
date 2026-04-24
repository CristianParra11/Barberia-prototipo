import { notFound } from "next/navigation"
import CitaDetalle from "@/components/dashboard/citas/cita-detalle"

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

export default async function CitaDetallePage({ params }: PageProps) {
  const cita = await getCita(params.id)

  if (!cita) {
    notFound()
  }

  return (
    <div className="container mx-auto">
      <CitaDetalle cita={cita} />
    </div>
  )
}
