"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient, type Empleado } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import EmpleadoDetalle from "@/components/dashboard/empleados/empleado-detalle"

export default function EmpleadoPage() {
  const params = useParams()
  const id = params?.id as string
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!id) {
      setError("ID de empleado no válido")
      setLoading(false)
      return
    }

    const loadEmpleado = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getEmpleado(id)

        if (response.success && response.data) {
          setEmpleado(response.data)
        } else {
          setError(response.error || "Empleado no encontrado")
          toast({
            title: "Error",
            description: response.error || "No se pudo cargar el empleado",
            variant: "destructive",
          })
        }
      } catch (error) {
        setError("Error de conexión")
        toast({
          title: "Error",
          description: "Error de conexión. Verifica tu conexión a internet.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadEmpleado()
  }, [id, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando empleado...</span>
      </div>
    )
  }

  if (error || !empleado) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Empleado no encontrado</h2>
        <p className="text-gray-600 mb-4">{error || "El empleado que buscas no existe o ha sido eliminado."}</p>
      </div>
    )
  }

  return <EmpleadoDetalle empleado={empleado} />
}
