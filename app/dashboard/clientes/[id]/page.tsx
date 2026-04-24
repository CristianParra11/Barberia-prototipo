"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Calendar, Phone, Mail, User, Clock } from "lucide-react"
import { apiClient, type Cliente } from "@/lib/api-client"

export default function ClienteDetallePage() {
  const params = useParams()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCliente = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("ID de cliente inválido")
        setIsLoading(false)
        return
      }

      try {
        const response = await apiClient.getCliente(params.id)

        if (response.success && response.data) {
          setCliente(response.data)
        } else {
          setError(response.error || "Cliente no encontrado")
        }
      } catch (error) {
        console.error("Error al cargar cliente:", error)
        setError("Error de conexión")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCliente()
  }, [params.id])

  // Formatear fecha
  const formatFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3b5d]">Error</h1>
            <p className="text-gray-600">{error || "Cliente no encontrado"}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a clientes
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No se pudo cargar la información del cliente.</p>
          <Button asChild>
            <Link href="/dashboard/clientes">Volver a la lista de clientes</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">
            {cliente.nombre} {cliente.apellido}
          </h1>
          <p className="text-gray-600">Información detallada del cliente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            <Link href={`/dashboard/clientes/${cliente.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full">
                {cliente.foto ? (
                  <Image
                    src={cliente.foto || "/placeholder.svg"}
                    alt={`${cliente.nombre} ${cliente.apellido}`}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d] text-xl font-medium">
                    {cliente.nombre.charAt(0)}
                    {cliente.apellido.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {cliente.nombre} {cliente.apellido}
                </h3>
                <p className="text-gray-600">Cliente</p>
              </div>
            </div>

            <div className="space-y-3">
              {cliente.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{cliente.email}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{cliente.telefono}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Registrado el {formatFecha(cliente.fecha_registro)}</span>
              </div>
            </div>

            {cliente.notas && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Notas:</h4>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{cliente.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas y Acciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial y Acciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Citas Totales</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Citas Completadas</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/dashboard/citas/nueva?cliente=${cliente.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar Nueva Cita
                </Link>
              </Button>

              <Button asChild className="w-full" variant="outline">
                <Link href={`/dashboard/clientes/${cliente.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Información
                </Link>
              </Button>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Estado del Cliente:</h4>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Activo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Citas (placeholder) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historial de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay citas registradas para este cliente</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href={`/dashboard/citas/nueva?cliente=${cliente.id}`}>Programar Primera Cita</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
