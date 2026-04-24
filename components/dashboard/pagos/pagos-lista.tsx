"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import {
  PlusCircle,
  Search,
  FileText,
  Receipt,
  Calendar,
  ShoppingBag,
  Filter,
  Scissors,
  Loader2,
  Trash2,
} from "lucide-react"
import gsap from "gsap"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PagosLista() {
  const router = useRouter()
  const { toast } = useToast()
  const containerRef = useRef(null)
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroFecha, setFiltroFecha] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [loading, setLoading] = useState(true)
  const [transacciones, setTransacciones] = useState<any[]>([])

  // Cargar transacciones
  const cargarTransacciones = async () => {
    try {
      setLoading(true)
      const response = await apiClient.request<any[]>(
        `/api/pagos?tipo=${activeTab === "todos" ? "" : activeTab}&search=${searchTerm}`,
      )

      if (response.success && response.data) {
        setTransacciones(response.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Error al cargar las transacciones",
        })
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar las transacciones",
      })
    } finally {
      setLoading(false)
    }
  }

  // Eliminar transacción
  const eliminarTransaccion = async (id: string) => {
    try {
      const response = await apiClient.request(`/api/pagos/${id}`, {
        method: "DELETE",
      })

      if (response.success) {
        toast({
          title: "Éxito",
          description: response.message || "Transacción eliminada exitosamente",
        })
        cargarTransacciones() // Recargar la lista
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error || "Error al eliminar la transacción",
        })
      }
    } catch (error) {
      console.error("Error eliminando transacción:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar la transacción",
      })
    }
  }

  useEffect(() => {
    cargarTransacciones()
  }, [activeTab, searchTerm])

  useEffect(() => {
    // Animación de entrada
    if (!loading) {
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }, [loading])

  // Filtrar transacciones
  const filtrarTransacciones = () => {
    return transacciones.filter((t) => {
      // Filtro por fecha
      const fechaTransaccion = new Date(t.fecha)
      const hoy = new Date()
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

      if (filtroFecha === "hoy" && fechaTransaccion.toDateString() !== hoy.toDateString()) return false
      if (filtroFecha === "semana" && fechaTransaccion < inicioSemana) return false
      if (filtroFecha === "mes" && fechaTransaccion < inicioMes) return false

      // Filtro por estado
      if (filtroEstado !== "todos" && t.estado !== filtroEstado) return false

      return true
    })
  }

  const transaccionesFiltradas = filtrarTransacciones()

  // Calcular totales
  const totalVentas = transaccionesFiltradas
    .filter((t) => t.tipo === "venta" && t.estado === "completada")
    .reduce((sum, t) => sum + (Number.parseFloat(t.total) || 0), 0)

  const totalServicios = transaccionesFiltradas
    .filter((t) => t.tipo === "servicio")
    .reduce((sum, t) => sum + (Number.parseFloat(t.total) || 0), 0)

  const totalGeneral = totalVentas + totalServicios

  // Formatear fecha
  const formatFecha = (fechaStr: string): string => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
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
        <span className="ml-2">Cargando transacciones...</span>
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="servicio">Servicios</TabsTrigger>
            <TabsTrigger value="venta">Ventas</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-1" asChild>
              <Link href="/dashboard/pagos/nuevo">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Pago</span>
              </Link>
            </Button>
            <Button variant="outline" className="gap-1" asChild>
              <Link href="/dashboard/pagos/informes">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Informes</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrecio(totalServicios)}</div>
              <p className="text-xs text-muted-foreground">
                {transaccionesFiltradas.filter((t) => t.tipo === "servicio").length} servicios
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrecio(totalVentas)}</div>
              <p className="text-xs text-muted-foreground">
                {transaccionesFiltradas.filter((t) => t.tipo === "venta" && t.estado === "completada").length} ventas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrecio(totalGeneral)}</div>
              <p className="text-xs text-muted-foreground">{transaccionesFiltradas.length} transacciones</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>Gestiona los pagos de servicios y ventas de productos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar por cliente, empleado o ID..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={filtroFecha} onValueChange={setFiltroFecha}>
                    <SelectTrigger className="w-[130px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las fechas</SelectItem>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="semana">Esta semana</SelectItem>
                      <SelectItem value="mes">Este mes</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="completada">Completados</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="cancelada">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaccionesFiltradas.length > 0 ? (
                      transaccionesFiltradas.map((transaccion) => (
                        <TableRow key={transaccion.id}>
                          <TableCell className="font-medium">{transaccion.id}</TableCell>
                          <TableCell>{formatFecha(transaccion.fecha)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {transaccion.tipo === "servicio" ? (
                                <Scissors className="mr-2 h-4 w-4" />
                              ) : (
                                <ShoppingBag className="mr-2 h-4 w-4" />
                              )}
                              {transaccion.tipo === "servicio" ? "Servicio" : "Venta"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {transaccion.cliente_nombre
                              ? `${transaccion.cliente_nombre} ${transaccion.cliente_apellido || ""}`
                              : "Cliente no registrado"}
                          </TableCell>
                          <TableCell>{formatPrecio(transaccion.total)}</TableCell>
                          <TableCell>
                            <Badge className={getColorEstado(transaccion.estado)}>
                              {transaccion.estado.charAt(0).toUpperCase() + transaccion.estado.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getColorMetodoPago(transaccion.metodo_pago)}>
                              {transaccion.metodo_pago.charAt(0).toUpperCase() + transaccion.metodo_pago.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => router.push(`/dashboard/pagos/${transaccion.id}`)}
                                title="Ver detalles"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => router.push(`/dashboard/pagos/${transaccion.id}/factura`)}
                                title="Ver factura"
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer.{" "}
                                      {transaccion.tipo === "venta"
                                        ? "Se eliminará la venta y se restaurará el stock de los productos."
                                        : "Se cancelará el servicio."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => eliminarTransaccion(transaccion.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No se encontraron transacciones
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {transaccionesFiltradas.length} de {transacciones.length} transacciones
              </div>
              <Button variant="outline" onClick={cargarTransacciones}>
                Actualizar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}
