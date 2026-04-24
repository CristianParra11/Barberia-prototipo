"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Clock,
  Scissors,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import gsap from "gsap"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatPrecio } from "@/lib/utils"
import { apiClient, type Cita } from "@/lib/api-client"

interface CitaDetalleProps {
  cita: Cita
}

export default function CitaDetalle({ cita: initialCita }: CitaDetalleProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [cita, setCita] = useState<Cita>(initialCita)
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const containerRef = useRef(null)
  const leftCardRef = useRef(null)
  const rightCardRef = useRef(null)

  // Establecer isMounted a true después del primer renderizado
  useEffect(() => {
    setIsMounted(true)
    loadCitaDetails()
  }, [])

  // Cargar detalles completos de la cita
  const loadCitaDetails = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getCita(initialCita.id)

      if (response.success && response.data) {
        setCita(response.data)
      }
    } catch (error) {
      console.error("Error loading cita details:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los detalles de la cita",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Efecto para las animaciones GSAP
  useEffect(() => {
    // Solo ejecutar animaciones cuando el componente esté montado y las referencias existan
    if (isMounted && containerRef.current && leftCardRef.current && rightCardRef.current) {
      const tl = gsap.timeline()

      tl.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })

      tl.from(
        leftCardRef.current,
        {
          x: -20,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
        },
        "-=0.3",
      )

      tl.from(
        rightCardRef.current,
        {
          x: 20,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
        },
        "-=0.3",
      )
    }
  }, [isMounted])

  // Formatear fecha
  const formatFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Formatear hora
  const formatHora = (hora: string): string => {
    const [h, m] = hora.split(":")
    const hour = Number.parseInt(h)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  // Color según estado de la cita
  const getColorEstado = (estado: string): string => {
    switch (estado) {
      case "programada":
        return "bg-blue-100 text-blue-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      case "no-asistio":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCancelCita = async () => {
    try {
      setIsUpdating(true)
      const response = await apiClient.updateCitaEstado(cita.id, "cancelada")

      if (response.success) {
        toast({
          title: "Cita cancelada",
          description: "La cita ha sido cancelada correctamente.",
        })
        router.push("/dashboard/citas")
      } else {
        throw new Error(response.error || "Error al cancelar la cita")
      }
    } catch (error) {
      console.error("Error canceling cita:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cancelar la cita",
      })
    } finally {
      setIsUpdating(false)
      setShowCancelDialog(false)
    }
  }

  const handleCompleteCita = async () => {
    try {
      setIsUpdating(true)
      const response = await apiClient.updateCitaEstado(cita.id, "completada")

      if (response.success) {
        toast({
          title: "Cita completada",
          description: "La cita ha sido marcada como completada.",
        })
        router.push("/dashboard/citas")
      } else {
        throw new Error(response.error || "Error al completar la cita")
      }
    } catch (error) {
      console.error("Error completing cita:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al completar la cita",
      })
    } finally {
      setIsUpdating(false)
      setShowCompleteDialog(false)
    }
  }

  // Obtener nombre del cliente
  const getNombreCliente = (): string => {
    if (cita.cliente_nombre && cita.cliente_apellido) {
      return `${cita.cliente_nombre} ${cita.cliente_apellido}`
    }
    return cita.cliente ? `${cita.cliente.nombre} ${cita.cliente.apellido}` : "Cliente desconocido"
  }

  // Obtener nombre del empleado
  const getNombreEmpleado = (): string => {
    if (cita.empleado_nombre && cita.empleado_apellido) {
      return `${cita.empleado_nombre} ${cita.empleado_apellido}`
    }
    return cita.empleado ? `${cita.empleado.nombre} ${cita.empleado.apellido}` : "Empleado desconocido"
  }

  // Renderizar un esqueleto de carga mientras el componente se está hidratando
  if (!isMounted || isLoading) {
    return (
      <div className="p-6 animate-pulse">
        {/* Barra superior */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-32 rounded-md bg-gray-200"></div>
          <div className="flex gap-2">
            <div className="h-10 w-32 rounded-md bg-gray-200"></div>
            <div className="h-10 w-32 rounded-md bg-gray-200"></div>
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tarjeta izquierda */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 rounded bg-gray-200"></div>
                <div className="h-6 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="p-4 space-y-6">
              {/* Detalles de la cita */}
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 rounded bg-gray-200"></div>
                      <div className="h-5 w-32 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Servicios */}
              <div className="rounded-md border border-gray-200 p-4">
                <div className="mb-3 h-5 w-32 rounded bg-gray-200"></div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-gray-200"></div>
                        <div className="space-y-2">
                          <div className="h-5 w-32 rounded bg-gray-200"></div>
                          <div className="h-4 w-20 rounded bg-gray-200"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta derecha */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <div className="h-6 w-40 rounded bg-gray-200"></div>
            </div>
            <div className="p-4 space-y-6">
              {/* Cliente */}
              <div className="rounded-md border border-gray-200 p-4">
                <div className="mb-3 h-5 w-24 rounded bg-gray-200"></div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>

              {/* Barbero */}
              <div className="rounded-md border border-gray-200 p-4">
                <div className="mb-3 h-5 w-24 rounded bg-gray-200"></div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>

              {/* Botón */}
              <div className="flex justify-center">
                <div className="h-10 w-full rounded-md bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6" ref={containerRef}>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/citas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a citas
          </Link>
        </Button>

        <div className="flex gap-2">
          {cita.estado === "programada" && (
            <>
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowCancelDialog(true)}
                disabled={isUpdating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar cita
              </Button>

              <Button
                variant="outline"
                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => setShowCompleteDialog(true)}
                disabled={isUpdating}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar
              </Button>
            </>
          )}

          {cita.estado === "programada" && (
            <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
              <Link href={`/dashboard/citas/${cita.id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar cita
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card ref={leftCardRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Detalles de la Cita</CardTitle>
              <Badge className={getColorEstado(cita.estado)}>
                {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1).replace("-", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatFecha(cita.fecha)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-medium">
                    {formatHora(cita.hora_inicio)} - {formatHora(cita.hora_fin)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Precio Total</p>
                  <p className="font-medium">{formatPrecio(cita.precio_total)}</p>
                </div>
              </div>

              {cita.notas && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Notas</p>
                    <p className="font-medium">{cita.notas}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="mb-3 font-medium text-[#1a3b5d]">Servicios</h3>
              <div className="space-y-3">
                {cita.servicios && cita.servicios.length > 0 ? (
                  cita.servicios.map((citaServicio) => (
                    <div key={citaServicio.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md">
                          {citaServicio.imagen ? (
                            <Image
                              src={citaServicio.imagen || "/placeholder.svg"}
                              alt={citaServicio.nombre || "Servicio"}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d]">
                              <Scissors className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{citaServicio.nombre || "Servicio"}</p>
                          <p className="text-sm text-gray-500">{citaServicio.duracion || 0} min</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrecio(citaServicio.precio || 0)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay servicios asociados</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card ref={rightCardRef}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Cliente y Barbero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="mb-3 font-medium text-[#1a3b5d]">Cliente</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full">
                  {cita.cliente_foto || cita.cliente?.foto ? (
                    <Image
                      src={cita.cliente_foto || cita.cliente?.foto || "/placeholder.svg"}
                      alt={getNombreCliente()}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-xl font-bold text-[#1a3b5d]">
                      {(cita.cliente_nombre || cita.cliente?.nombre || "C").charAt(0)}
                      {(cita.cliente_apellido || cita.cliente?.apellido || "").charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium">{getNombreCliente()}</p>
                  <p className="text-gray-500">{cita.cliente_email || cita.cliente?.email || "Sin email"}</p>
                  <p className="text-gray-500">{cita.cliente_telefono || cita.cliente?.telefono || "Sin teléfono"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="mb-3 font-medium text-[#1a3b5d]">Barbero</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full">
                  {cita.empleado_foto || cita.empleado?.foto ? (
                    <Image
                      src={cita.empleado_foto || cita.empleado?.foto || "/placeholder.svg"}
                      alt={getNombreEmpleado()}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-xl font-bold text-[#1a3b5d]">
                      {(cita.empleado_nombre || cita.empleado?.nombre || "E").charAt(0)}
                      {(cita.empleado_apellido || cita.empleado?.apellido || "").charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium">{getNombreEmpleado()}</p>
                  <p className="text-gray-500">{cita.empleado_email || cita.empleado?.email || "Sin email"}</p>
                  <p className="text-gray-500">{cita.empleado_telefono || cita.empleado?.telefono || "Sin teléfono"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/citas/nueva?cliente=${cita.cliente_id}&empleado=${cita.empleado_id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar nueva cita para este cliente
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación para cancelar cita */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isUpdating}>
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancelCita} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar cancelación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para completar cita */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar cita</DialogTitle>
            <DialogDescription>¿Confirmas que esta cita ha sido completada?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)} disabled={isUpdating}>
              Volver
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCompleteCita}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
