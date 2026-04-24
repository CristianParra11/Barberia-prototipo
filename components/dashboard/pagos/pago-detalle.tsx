"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import {
  ArrowLeft,
  Receipt,
  Printer,
  Clock,
  Calendar,
  User,
  CreditCard,
  FileText,
  ShoppingBag,
  Scissors,
  Loader2,
} from "lucide-react"
import gsap from "gsap"
import Link from "next/link"

interface PagoDetalleProps {
  id: string
}

export default function PagoDetalle({ id }: PagoDetalleProps) {
  const router = useRouter()
  const { toast } = useToast()
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [transaccion, setTransaccion] = useState<any>(null)

  // Cargar datos de la transacción
  useEffect(() => {
    const cargarTransaccion = async () => {
      try {
        setLoading(true)
        const response = await apiClient.request<any>(`/api/pagos/${id}`)

        if (response.success && response.data) {
          setTransaccion(response.data)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.error || "Transacción no encontrada",
          })
          router.push("/dashboard/pagos")
        }
      } catch (error) {
        console.error("Error cargando transacción:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al cargar los detalles de la transacción",
        })
        router.push("/dashboard/pagos")
      } finally {
        setLoading(false)
      }
    }

    cargarTransaccion()
  }, [id, router, toast])

  useEffect(() => {
    // Animación de entrada
    if (!loading && transaccion) {
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }, [loading, transaccion])

  // Formatear fecha
  const formatFecha = (fechaStr: string): string => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Formatear precio
  const formatPrecio = (precio: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(precio)
  }

  // Obtener color según estado
  const getColorEstado = (estado: string): string => {
    switch (estado) {
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      case "pendiente":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Obtener color según método de pago
  const getColorMetodoPago = (metodo: string): string => {
    switch (metodo) {
      case "efectivo":
        return "bg-blue-100 text-blue-800"
      case "tarjeta":
        return "bg-purple-100 text-purple-800"
      case "transferencia":
        return "bg-indigo-100 text-indigo-800"
      case "pendiente":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando detalles...</span>
      </div>
    )
  }

  if (!transaccion) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p>Transacción no encontrada</p>
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/pagos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a pagos
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/pagos/${id}/factura`}>
              <Receipt className="mr-2 h-4 w-4" />
              Ver Factura
            </Link>
          </Button>

          <Button className="bg-[#1a3b5d] hover:bg-[#2a4b6d]" asChild>
            <Link href={`/dashboard/pagos/${id}/factura?print=true`}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Detalles de la Transacción</CardTitle>
              <Badge className={getColorEstado(transaccion.estado)}>
                {transaccion.estado.charAt(0).toUpperCase() + transaccion.estado.slice(1)}
              </Badge>
            </div>
            <CardDescription>
              {transaccion.tipo === "venta" ? "Venta de productos" : "Pago de servicios"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Número de Referencia</p>
                  <p className="font-medium">{id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatFecha(transaccion.fecha)}</p>
                </div>
              </div>

              {transaccion.tipo === "servicio" && transaccion.hora_inicio && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-medium">
                      {transaccion.hora_inicio} - {transaccion.hora_fin}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Método de Pago</p>
                  <Badge className={getColorMetodoPago(transaccion.metodo_pago)}>
                    {transaccion.metodo_pago.charAt(0).toUpperCase() + transaccion.metodo_pago.slice(1)}
                  </Badge>
                </div>
              </div>

              {transaccion.notas && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Notas</p>
                    <p className="font-medium">{transaccion.notas}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="mb-3 font-medium text-[#1a3b5d]">
                {transaccion.tipo === "venta" ? "Productos" : "Servicios"}
              </h3>

              {transaccion.tipo === "venta" ? (
                <div className="space-y-3">
                  {transaccion.productos?.map((item: any) => (
                    <div key={item.producto_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md">
                          {item.producto_imagen ? (
                            <Image
                              src={item.producto_imagen || "/placeholder.svg"}
                              alt={item.producto_nombre}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d]">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.producto_nombre}</p>
                          <p className="text-sm text-gray-500">
                            {item.cantidad} x {formatPrecio(item.precio_unitario)}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrecio(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {transaccion.servicios?.map((item: any) => (
                    <div key={item.servicio_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md">
                          {item.servicio_imagen ? (
                            <Image
                              src={item.servicio_imagen || "/placeholder.svg"}
                              alt={item.servicio_nombre}
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
                          <p className="font-medium">{item.servicio_nombre}</p>
                          <p className="text-sm text-gray-500">{item.servicio_duracion} min</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrecio(item.precio)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="font-medium">Total</p>
                <p className="text-lg font-bold">{formatPrecio(transaccion.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {transaccion.cliente_nombre ? (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full">
                    {transaccion.cliente_foto ? (
                      <Image
                        src={transaccion.cliente_foto || "/placeholder.svg"}
                        alt={`${transaccion.cliente_nombre} ${transaccion.cliente_apellido}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e6f0f9] text-xl font-bold text-[#1a3b5d]">
                        {transaccion.cliente_nombre.charAt(0)}
                        {transaccion.cliente_apellido?.charAt(0) || ""}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {transaccion.cliente_nombre} {transaccion.cliente_apellido}
                    </p>
                    <p className="text-gray-500">{transaccion.cliente_email}</p>
                    <p className="text-gray-500">{transaccion.cliente_telefono}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Cliente no registrado</p>
                    <p className="text-sm text-gray-500">Venta realizada sin registro de cliente</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              {transaccion.empleado_nombre ? (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full">
                    {transaccion.empleado_foto ? (
                      <Image
                        src={transaccion.empleado_foto || "/placeholder.svg"}
                        alt={`${transaccion.empleado_nombre} ${transaccion.empleado_apellido}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e6f0f9] text-xl font-bold text-[#1a3b5d]">
                        {transaccion.empleado_nombre.charAt(0)}
                        {transaccion.empleado_apellido?.charAt(0) || ""}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {transaccion.empleado_nombre} {transaccion.empleado_apellido}
                    </p>
                    <p className="text-gray-500">{transaccion.empleado_puesto}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Empleado no asignado</p>
                    <p className="text-sm text-gray-500">No hay un empleado asociado a esta transacción</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/pagos/${id}/factura`}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Ver factura completa
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/pagos/${id}/factura?print=true`}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir factura
                  </Link>
                </Button>
                {transaccion.tipo === "venta" && transaccion.estado !== "cancelada" && (
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/dashboard/pagos/${id}/devolucion`}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Registrar devolución
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
