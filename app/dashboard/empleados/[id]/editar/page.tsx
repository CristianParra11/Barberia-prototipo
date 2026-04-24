"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiClient, type Empleado } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import EmpleadoForm from "@/components/dashboard/empleados/empleado-form"

export default function EditarEmpleadoPage() {
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
        <Button variant="outline" asChild>
          <Link href="/dashboard/empleados">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a empleados
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a3b5d]">Editar Empleado</h1>
          <p className="text-muted-foreground">
            Modificar información de {empleado.nombre} {empleado.apellido}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/empleados">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1a3b5d]">Información del Empleado</CardTitle>
          <CardDescription>Actualiza los datos del empleado</CardDescription>
        </CardHeader>
        <CardContent>
          <EmpleadoForm empleado={empleado} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  )
}
