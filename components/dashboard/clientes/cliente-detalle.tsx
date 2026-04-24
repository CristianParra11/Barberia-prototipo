"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Calendar, Mail, Phone, FileText, ShoppingBag } from "lucide-react"
import { getCitasByCliente, getVentasByCliente, getServicioById, getProductoById, type Cliente } from "@/lib/data"
import gsap from "gsap"

interface ClienteDetalleProps {
  cliente: Cliente
}

export default function ClienteDetalle({ cliente }: ClienteDetalleProps) {
  const containerRef = useRef(null)
  const leftCardRef = useRef(null)
  const rightCardRef = useRef(null)

  const citas = getCitasByCliente(cliente.id)
  const ventas = getVentasByCliente(cliente.id)

  useEffect(() => {
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
  }, [])

  // Formatear fecha
  const formatFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString("es-ES", {
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

  // Formatear precio
  const formatPrecio = (precio: number): string => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COP",
    }).format(precio)
  }

  // Calcular total gastado
  const calcularTotalGastado = (): number => {
    const totalCitas = citas.reduce((total, cita) => total + cita.precioTotal, 0)
    const totalVentas = ventas.reduce((total, venta) => total + venta.total, 0)
    return totalCitas + totalVentas
  }

  return (
    <div className="p-6" ref={containerRef}>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a clientes
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d] hover:bg-[#d5e5f5]">
            <Link href={`/dashboard/citas/nueva?cliente=${cliente.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              Programar cita
            </Link>
          </Button>
          <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            <Link href={`/dashboard/clientes/${cliente.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar cliente
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1" ref={leftCardRef}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a3b5d]">
              {cliente.nombre} {cliente.apellido}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-[#e6f0f9]">
                {cliente.foto ? (
                  <Image
                    src={cliente.foto || "/placeholder.svg"}
                    alt={`${cliente.nombre} ${cliente.apellido}`}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-4xl font-bold text-[#1a3b5d]">
                    {cliente.nombre.charAt(0)}
                    {cliente.apellido.charAt(0)}
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{cliente.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{cliente.telefono}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente desde</p>
                    <p className="font-medium">{formatFecha(cliente.fechaRegistro)}</p>
                  </div>
                </div>

                {cliente.notas && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Notas</p>
                      <p className="font-medium">{cliente.notas}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2" ref={rightCardRef}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Historial del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500">Citas totales</p>
                <p className="text-2xl font-bold text-[#1a3b5d]">{citas.length}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500">Compras</p>
                <p className="text-2xl font-bold text-[#1a3b5d]">{ventas.length}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500">Total gastado</p>
                <p className="text-2xl font-bold text-[#1a3b5d]">{formatPrecio(calcularTotalGastado())}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-[#1a3b5d]">Últimas Citas</h3>
              {citas.length > 0 ? (
                <div className="space-y-3">
                  {citas
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .slice(0, 3)
                    .map((cita) => (
                      <div key={cita.id} className="rounded-md border border-gray-200 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {formatFecha(cita.fecha)} - {formatHora(cita.horaInicio)}
                            </span>
                          </div>
                          <Badge
                            className={
                              cita.estado === "programada"
                                ? "bg-blue-100 text-blue-800"
                                : cita.estado === "completada"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Servicios:</p>
                          <div className="flex flex-wrap gap-1">
                            {cita.servicioIds.map((servicioId) => {
                              const servicio = getServicioById(servicioId)
                              return (
                                <Badge key={servicioId} variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d]">
                                  {servicio?.nombre || "Servicio desconocido"}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="font-medium">{formatPrecio(cita.precioTotal)}</span>
                        </div>
                      </div>
                    ))}
                  {citas.length > 3 && (
                    <div className="text-center">
                      <Button asChild variant="link" className="text-[#1a3b5d]">
                        <Link href={`/dashboard/citas?cliente=${cliente.id}`}>Ver todas las citas</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-gray-200 p-4 text-center text-gray-500">
                  No hay citas registradas para este cliente
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 font-medium text-[#1a3b5d]">Últimas Compras</h3>
              {ventas.length > 0 ? (
                <div className="space-y-3">
                  {ventas
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .slice(0, 3)
                    .map((venta) => (
                      <div key={venta.id} className="rounded-md border border-gray-200 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{formatFecha(venta.fecha.split("T")[0])}</span>
                          </div>
                          <Badge
                            className={
                              venta.estado === "completada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Productos:</p>
                          <div className="flex flex-wrap gap-1">
                            {venta.productos.map((item) => {
                              const producto = getProductoById(item.productoId)
                              return (
                                <Badge key={item.productoId} variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d]">
                                  {producto?.nombre || "Producto desconocido"} x{item.cantidad}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="font-medium">{formatPrecio(venta.total)}</span>
                        </div>
                      </div>
                    ))}
                  {ventas.length > 3 && (
                    <div className="text-center">
                      <Button asChild variant="link" className="text-[#1a3b5d]">
                        <Link href={`/dashboard/ventas?cliente=${cliente.id}`}>Ver todas las compras</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-gray-200 p-4 text-center text-gray-500">
                  No hay compras registradas para este cliente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
