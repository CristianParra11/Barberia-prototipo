"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Pencil, DollarSign, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, type Servicio } from "@/lib/api-client"

interface ServicioDetalleProps {
  servicioId: string
}

export default function ServicioDetalle({ servicioId }: ServicioDetalleProps) {
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadServicio = async () => {
      setLoading(true)
      try {
        const response = await apiClient.getServicio(servicioId)
        if (response.success && response.data) {
          setServicio(response.data)
        } else {
          toast({
            title: "Error",
            description: response.error || "Error al cargar el servicio",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error de conexión al cargar el servicio",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadServicio()
  }, [servicioId, toast])

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio)
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Skeleton className="mb-4 h-48 w-full rounded-lg" />
                <Skeleton className="mb-4 h-6 w-24" />
                <div className="w-full space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="mb-2 h-6 w-1/3" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-6 w-1/3" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!servicio) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Servicio no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/servicios">Volver a servicios</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild className="animate-slide-right">
          <Link href="/dashboard/servicios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a servicios
          </Link>
        </Button>
        <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d] animate-slide-left">
          <Link href={`/dashboard/servicios/${servicio.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar servicio
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 animate-fade-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-[#1a3b5d]">{servicio.nombre}</CardTitle>
              {servicio.destacado && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="mb-4 h-48 w-full overflow-hidden rounded-lg border-4 border-[#e6f0f9] animate-scale-in">
                {servicio.imagen ? (
                  <Image
                    src={servicio.imagen || "/placeholder.svg"}
                    alt={servicio.nombre}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-4xl font-bold text-[#1a3b5d]">
                    {servicio.nombre.charAt(0)}
                  </div>
                )}
              </div>

              <Badge
                variant={servicio.estado === "activo" ? "default" : "secondary"}
                className={
                  servicio.estado === "activo" ? "mb-4 bg-green-100 text-green-800" : "mb-4 bg-gray-100 text-gray-800"
                }
              >
                {servicio.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between rounded-md border border-gray-200 p-3 animate-fade-up delay-100">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-gray-500" />
                    <span>Precio</span>
                  </div>
                  <span className="font-bold text-[#1a3b5d]">{formatPrecio(servicio.precio)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-200 p-3 animate-fade-up delay-200">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-gray-500" />
                    <span>Duración</span>
                  </div>
                  <span className="font-bold text-[#1a3b5d]">{servicio.duracion} minutos</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-200 p-3 animate-fade-up delay-300">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2 bg-[#e6f0f9] text-[#1a3b5d]">
                      Categoría
                    </Badge>
                  </div>
                  <span className="font-bold text-[#1a3b5d]">{servicio.categoria}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Detalles del servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="animate-fade-up delay-300">
              <h3 className="mb-2 text-lg font-medium text-[#1a3b5d]">Descripción</h3>
              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-gray-600">{servicio.descripcion}</p>
              </div>
            </div>

            <div className="animate-fade-up delay-500">
              <h3 className="mb-2 text-lg font-medium text-[#1a3b5d]">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500">Total Citas</p>
                  <p className="text-2xl font-bold text-[#1a3b5d]">{(servicio as any).estadisticas?.totalCitas || 0}</p>
                </div>
                <div className="rounded-md border border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500">Completadas</p>
                  <p className="text-2xl font-bold text-[#1a3b5d]">
                    {(servicio as any).estadisticas?.citasCompletadas || 0}
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-500">Programadas</p>
                  <p className="text-2xl font-bold text-[#1a3b5d]">
                    {(servicio as any).estadisticas?.citasProgramadas || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
