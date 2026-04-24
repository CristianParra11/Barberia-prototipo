"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Users,
  Package,
  CreditCard,
  ShoppingBag,
  Bell,
  Scissors,
  CheckCircle,
  AlertTriangle,
  Info,
  MoreHorizontal,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Star,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Tipos para las notificaciones
type TipoNotificacion = "info" | "warning" | "success" | "error"

interface Notificacion {
  id: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  tiempo: string
  leida: boolean
  link?: string
}

// Función para formatear precios
const formatPrecio = (precio: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(precio)
}

// Función para formatear porcentajes de cambio
const formatearCambio = (cambio: number) => {
  const esPositivo = cambio >= 0
  const icono = esPositivo ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />
  const color = esPositivo ? "text-green-600" : "text-red-600"

  return (
    <span className={`flex items-center text-xs ${color}`}>
      {icono}
      {Math.abs(cambio).toFixed(1)}%
    </span>
  )
}

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabActiva, setTabActiva] = useState("general")
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [animationStage, setAnimationStage] = useState(0)

  // Estado para las notificaciones
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: "1",
      tipo: "info",
      titulo: "Recordatorio de citas",
      mensaje: "Tienes citas programadas para hoy.",
      tiempo: "Hace 1 hora",
      leida: false,
      link: "/dashboard/citas",
    },
    {
      id: "2",
      tipo: "warning",
      titulo: "Stock bajo",
      mensaje: "Algunos productos están por debajo del stock mínimo.",
      tiempo: "Hace 3 horas",
      leida: false,
      link: "/dashboard/inventario",
    },
    {
      id: "3",
      tipo: "success",
      titulo: "Meta alcanzada",
      mensaje: "¡Has alcanzado una nueva meta de ventas!",
      tiempo: "Hace 1 día",
      leida: true,
    },
  ])

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const cargarStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/dashboard/stats")
        const result = await response.json()

        if (result.success) {
          setStats(result.data)

          // Actualizar notificaciones basadas en los datos
          const nuevasNotificaciones = [...notificaciones]

          if (result.data.citas.hoy > 0) {
            nuevasNotificaciones[0].mensaje = `Tienes ${result.data.citas.hoy} citas programadas para hoy.`
          }

          if (result.data.resumen.productosStockBajo > 0) {
            nuevasNotificaciones[1].mensaje = `${result.data.resumen.productosStockBajo} productos están por debajo del stock mínimo.`
          }

          setNotificaciones(nuevasNotificaciones)
        } else {
          setError(result.error || "Error al cargar estadísticas")
        }
      } catch (error) {
        console.error("Error cargando stats:", error)
        setError("Error de conexión al cargar estadísticas")
      } finally {
        setIsLoading(false)
      }
    }

    cargarStats()
  }, [])

  // Verificar que estamos en el cliente y configurar animaciones secuenciales
  useEffect(() => {
    setIsMounted(true)

    // Secuencia de animación
    const timer1 = setTimeout(() => setAnimationStage(1), 100)
    const timer2 = setTimeout(() => setAnimationStage(2), 300)
    const timer3 = setTimeout(() => setAnimationStage(3), 500)
    const timer4 = setTimeout(() => setAnimationStage(4), 700)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  // Marcar notificación como leída
  const marcarComoLeida = (id: string) => {
    setNotificaciones(notificaciones.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif)))
  }

  // Eliminar notificación
  const eliminarNotificacion = (id: string) => {
    setNotificaciones(notificaciones.filter((notif) => notif.id !== id))
  }

  // Contar notificaciones no leídas
  const notificacionesNoLeidas = notificaciones.filter((notif) => !notif.leida).length

  // Función para obtener el icono según el tipo de notificación
  const getIconoNotificacion = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  // Función para obtener el color de fondo según el tipo de notificación
  const getColorNotificacion = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case "info":
        return "bg-blue-50 border-blue-100"
      case "warning":
        return "bg-amber-50 border-amber-100"
      case "success":
        return "bg-green-50 border-green-100"
      case "error":
        return "bg-red-50 border-red-100"
      default:
        return "bg-gray-50 border-gray-100"
    }
  }

  // Función para obtener el color del icono según el tipo de notificación
  const getColorIconoNotificacion = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case "info":
        return "bg-blue-100"
      case "warning":
        return "bg-amber-100"
      case "success":
        return "bg-green-100"
      case "error":
        return "bg-red-100"
      default:
        return "bg-gray-100"
    }
  }

  // Si no estamos en el cliente, mostrar un placeholder
  if (!isMounted) {
    return (
      <div className="p-4 max-w-[1600px] mx-auto">
        <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-[1600px] mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-500 ease-out transform opacity-0 translate-y-4 animate-in">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Panel de Control</h1>
          <p className="text-gray-600">Bienvenido al sistema de gestión de Click Barber</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          {/* Panel de notificaciones */}
          <Popover open={notificacionesAbiertas} onOpenChange={setNotificacionesAbiertas}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
              <div className="border-b border-gray-100 p-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#1a3b5d]">Notificaciones</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificaciones(notificaciones.map((n) => ({ ...n, leida: true })))}
                    className="text-xs h-8"
                  >
                    Marcar todas como leídas
                  </Button>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notificaciones.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notificaciones.map((notif) => (
                      <div key={notif.id} className={`p-3 ${!notif.leida ? "bg-gray-50" : ""} relative`}>
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full ${getColorIconoNotificacion(notif.tipo)} p-2 mt-1`}>
                            {getIconoNotificacion(notif.tipo)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <p className="font-medium">{notif.titulo}</p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => marcarComoLeida(notif.id)}>
                                    Marcar como leída
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => eliminarNotificacion(notif.id)}>
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-sm text-gray-700">{notif.mensaje}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">{notif.tiempo}</p>
                              {notif.link && (
                                <Link href={notif.link} onClick={() => marcarComoLeida(notif.id)}>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#1a3b5d]">
                                    Ver detalles
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        {!notif.leida && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No hay notificaciones</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Pestañas principales */}
      <Tabs defaultValue="general" value={tabActiva} onValueChange={setTabActiva} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ventas">Ventas y Servicios</TabsTrigger>
          <TabsTrigger value="equipo">Equipo y Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0">
          <div className="space-y-6">
            {/* Estadísticas principales con datos reales */}
            <div
              className={`grid gap-6 md:grid-cols-2 lg:grid-cols-4 transition-all duration-500 ease-out transform ${animationStage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Card className="border-gray-200">
                <CardContent className="flex items-center p-4">
                  <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
                    <DollarSign className="h-6 w-6 text-[#1a3b5d]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ingresos del Mes</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-[#1a3b5d]">
                        {formatPrecio(stats?.ingresos?.totalMes || 0)}
                      </p>
                      <div className="ml-2">{formatearCambio(stats?.ingresos?.cambioTotalMes || 0)}</div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Servicios: {formatPrecio(stats?.ingresos?.serviciosMes || 0)} | Ventas:{" "}
                      {formatPrecio(stats?.ingresos?.ventasMes || 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="flex items-center p-4">
                  <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
                    <Calendar className="h-6 w-6 text-[#1a3b5d]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Citas del Mes</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-[#1a3b5d]">{stats?.citas?.mes || 0}</p>
                      <div className="ml-2">{formatearCambio(stats?.citas?.cambioMes || 0)}</div>
                    </div>
                    <p className="text-xs text-gray-500">{stats?.citas?.hoy || 0} citas hoy</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="flex items-center p-4">
                  <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
                    <Users className="h-6 w-6 text-[#1a3b5d]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Clientes</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-[#1a3b5d]">{stats?.resumen?.totalClientes || 0}</p>
                      <div className="ml-2">{formatearCambio(stats?.clientes?.cambioMes || 0)}</div>
                    </div>
                    <p className="text-xs text-gray-500">{stats?.clientes?.nuevosMes || 0} nuevos este mes</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="flex items-center p-4">
                  <div className="mr-4 rounded-full bg-[#e6f0f9] p-3">
                    <Package className="h-6 w-6 text-[#1a3b5d]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Productos</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-bold text-[#1a3b5d]">{stats?.resumen?.totalProductos || 0}</p>
                      {(stats?.resumen?.productosStockBajo || 0) > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {stats?.resumen?.productosStockBajo}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{stats?.resumen?.productosStockBajo || 0} con poco stock</p>
                  </div>
                </CardContent>
              </Card>
            </div>

           

            {/* Resumen de actividad reciente */}
            <div
              className={`grid gap-6 md:grid-cols-2 transition-all duration-500 ease-out transform ${animationStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#1a3b5d]">Próximas Citas</CardTitle>
                  <CardDescription>Citas programadas próximamente</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.citas?.proximas && stats.citas.proximas.length > 0 ? (
                    <div className="space-y-4">
                      {stats.citas.proximas.slice(0, 3).map((cita: any) => (
                        <div key={cita.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#e6f0f9] flex items-center justify-center mr-3">
                              <Calendar className="h-4 w-4 text-[#1a3b5d]" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {cita.cliente_nombre} {cita.cliente_apellido}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(cita.fecha).toLocaleDateString()} - {cita.hora_inicio}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrecio(cita.precio_total)}</p>
                            <p className="text-xs text-gray-500">{cita.empleado_nombre}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay citas próximas</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/citas" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Todas las Citas
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#1a3b5d]">Ventas Recientes</CardTitle>
                  <CardDescription>Últimas transacciones completadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.actividad?.ventasRecientes && stats.actividad.ventasRecientes.length > 0 ? (
                    <div className="space-y-4">
                      {stats.actividad.ventasRecientes.slice(0, 3).map((venta: any) => (
                        <div key={venta.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#e6f0f9] flex items-center justify-center mr-3">
                              <ShoppingBag className="h-4 w-4 text-[#1a3b5d]" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {venta.cliente_nombre} {venta.cliente_apellido}
                              </p>
                              <p className="text-xs text-gray-500">{new Date(venta.fecha).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrecio(venta.total)}</p>
                            <p className="text-xs text-gray-500">{venta.empleado_nombre}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay ventas recientes</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/pagos" className="w-full">
                    <Button variant="outline" className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Ver Todas las Ventas
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ventas" className="mt-0">
          <div className="space-y-6">
            {/* Top servicios y productos */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#1a3b5d] flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Servicios Más Populares
                  </CardTitle>
                  <CardDescription>Los servicios más solicitados este mes</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.actividad?.topServicios && stats.actividad.topServicios.length > 0 ? (
                    <div className="space-y-4">
                      {stats.actividad.topServicios.map((servicio: any, index: number) => (
                        <div key={servicio.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#e6f0f9] flex items-center justify-center mr-3">
                              <span className="text-sm font-bold text-[#1a3b5d]">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{servicio.nombre}</p>
                              <p className="text-xs text-gray-500">{servicio.cantidad_solicitada} servicios</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrecio(servicio.precio)}</p>
                            <p className="text-xs text-gray-500">{formatPrecio(servicio.total_ingresos)} total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Scissors className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay datos de servicios</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/servicios" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Scissors className="h-4 w-4 mr-2" />
                      Ver Todos los Servicios
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#1a3b5d] flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Productos Más Vendidos
                  </CardTitle>
                  <CardDescription>Los productos más vendidos este mes</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.actividad?.topProductos && stats.actividad.topProductos.length > 0 ? (
                    <div className="space-y-4">
                      {stats.actividad.topProductos.map((producto: any, index: number) => (
                        <div key={producto.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#e6f0f9] flex items-center justify-center mr-3">
                              <span className="text-sm font-bold text-[#1a3b5d]">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{producto.nombre}</p>
                              <p className="text-xs text-gray-500">{producto.cantidad_vendida} unidades</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrecio(producto.precio)}</p>
                            <p className="text-xs text-gray-500">{formatPrecio(producto.total_ventas)} total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay datos de productos</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/inventario" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Ver Todos los Productos
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="equipo" className="mt-0">
          <div className="space-y-6">
            {/* Rendimiento de empleados */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1a3b5d] flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Rendimiento del Equipo
                </CardTitle>
                <CardDescription>Desempeño de los empleados este mes</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.actividad?.rendimientoEmpleados && stats.actividad.rendimientoEmpleados.length > 0 ? (
                  <div className="space-y-6">
                    {stats.actividad.rendimientoEmpleados.map((empleado: any) => (
                      <div key={empleado.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={empleado.foto || "/placeholder.svg"} alt={empleado.nombre} />
                              <AvatarFallback>
                                {empleado.nombre.charAt(0)}
                                {empleado.apellido.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {empleado.nombre} {empleado.apellido}
                              </p>
                              <p className="text-xs text-gray-500">{empleado.puesto}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrecio(empleado.total_generado)}</p>
                            <p className="text-xs text-gray-500">
                              {empleado.total_citas} servicios · {empleado.total_ventas} ventas
                            </p>
                          </div>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            (empleado.total_generado / (stats.actividad.rendimientoEmpleados[0]?.total_generado || 1)) *
                              100,
                          )}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No hay datos de rendimiento</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/empleados" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Ver Todos los Empleados
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
