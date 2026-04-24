"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, Search, Calendar, Filter, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { formatPrecio } from "@/lib/utils"
import { apiClient, type Cita } from "@/lib/api-client"

type EstadoCita = "programada" | "completada" | "cancelada" | "no-asistio"

export default function CitasLista() {
  const [searchTerm, setSearchTerm] = useState("")
  const [citas, setCitas] = useState<Cita[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [citaToDelete, setCitaToDelete] = useState<Cita | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<EstadoCita | "todos">("todos")
  const [filtroFecha, setFiltroFecha] = useState<"hoy" | "semana" | "mes" | "todos">("todos")
  const router = useRouter()
  const { toast } = useToast()

  const estadosCita: EstadoCita[] = ["programada", "completada", "cancelada", "no-asistio"]

  // Cargar citas al montar el componente
  useEffect(() => {
    loadCitas()
  }, [])

  const loadCitas = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getCitas(searchTerm)

      if (response.success && response.data) {
        setCitas(response.data)
      } else {
        throw new Error(response.error || "Error al cargar las citas")
      }
    } catch (error) {
      console.error("Error loading citas:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar las citas",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Recargar citas cuando cambia el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCitas()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Aplicar filtros
  const citasFiltradas = citas.filter((cita) => {
    // Filtro por estado
    if (filtroEstado !== "todos" && cita.estado !== filtroEstado) {
      return false
    }

    // Filtro por fecha
    if (filtroFecha !== "todos") {
      const fechaCita = new Date(cita.fecha)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (filtroFecha === "hoy") {
        const fechaHoy = hoy.toISOString().split("T")[0]
        if (cita.fecha !== fechaHoy) {
          return false
        }
      } else if (filtroFecha === "semana") {
        const unaSemana = new Date(hoy)
        unaSemana.setDate(hoy.getDate() + 7)
        if (fechaCita < hoy || fechaCita > unaSemana) {
          return false
        }
      } else if (filtroFecha === "mes") {
        const unMes = new Date(hoy)
        unMes.setMonth(hoy.getMonth() + 1)
        if (fechaCita < hoy || fechaCita > unMes) {
          return false
        }
      }
    }

    return true
  })

  const handleDeleteClick = (cita: Cita) => {
    setCitaToDelete(cita)
  }

  const confirmDelete = async () => {
    if (!citaToDelete) return

    try {
      setIsDeleting(true)
      const response = await apiClient.deleteCita(citaToDelete.id)

      if (response.success) {
        setCitas(citas.filter((c) => c.id !== citaToDelete.id))
        toast({
          title: "Cita eliminada",
          description: "La cita ha sido eliminada correctamente.",
        })
      } else {
        throw new Error(response.error || "Error al eliminar la cita")
      }
    } catch (error) {
      console.error("Error deleting cita:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar la cita",
      })
    } finally {
      setIsDeleting(false)
      setCitaToDelete(null)
    }
  }

  // Formatear fecha sin problemas de zona horaria
  const formatFecha = (fecha: string): string => {
    console.log("=== FORMATEAR FECHA ===")
    console.log("Fecha recibida:", fecha)
    console.log("Tipo:", typeof fecha)

    // Validar que la fecha existe
    if (!fecha || typeof fecha !== "string") {
      console.error("Fecha inválida:", fecha)
      return "Fecha no disponible"
    }

    let fechaLimpia: string

    // Si es formato ISO (2025-05-26T00:00:00.000Z), extraer solo la parte de fecha
    if (fecha.includes("T")) {
      fechaLimpia = fecha.split("T")[0]
      console.log("📅 Formato ISO detectado, fecha extraída:", fechaLimpia)
    }
    // Si ya es formato YYYY-MM-DD
    else {
      fechaLimpia = fecha
      console.log("📝 Formato simple detectado:", fechaLimpia)
    }

    // Verificar formato YYYY-MM-DD después de limpiar
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(fechaLimpia)) {
      console.error("❌ Formato inválido después de limpiar:", fechaLimpia)
      return "Formato de fecha inválido"
    }

    try {
      // Crear fecha directamente desde el string YYYY-MM-DD sin conversión UTC
      const [year, month, day] = fechaLimpia.split("-").map(Number)

      // Validar que los números son válidos
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error("Componentes de fecha inválidos:", { year, month, day })
        return "Fecha inválida"
      }

      const date = new Date(year, month - 1, day) // month - 1 porque los meses en JS van de 0-11

      // Verificar que la fecha creada es válida
      if (isNaN(date.getTime())) {
        console.error("Fecha resultante inválida:", date)
        return "Fecha inválida"
      }

      const resultado = date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })

      console.log("✅ Resultado final:", resultado)
      console.log("=======================")
      return resultado
    } catch (error) {
      console.error("Error al formatear fecha:", error, "Fecha original:", fecha)
      return "Error en fecha"
    }
  }

  // Función de debugging mejorada
  const debugFecha = (fecha: string) => {
    console.log("=== DEBUG FECHA ===")
    console.log("Fecha original de BD:", fecha, "Tipo:", typeof fecha)

    if (!fecha) {
      console.log("❌ Fecha es null/undefined")
      return
    }

    const [year, month, day] = fecha.split("-").map(Number)
    console.log("Componentes:", { year, month, day })

    const date = new Date(year, month - 1, day)
    console.log("Fecha procesada:", date)
    console.log("Es válida:", !isNaN(date.getTime()))
    console.log("Fecha formateada:", formatFecha(fecha))
    console.log("==================")
  }

  // Formatear hora
  const formatHora = (hora: string): string => {
    const [h, m] = hora.split(":")
    const hour = Number.parseInt(h)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  // Obtener nombre del cliente
  const getNombreCliente = (cita: Cita): string => {
    if (cita.cliente_nombre && cita.cliente_apellido) {
      return `${cita.cliente_nombre} ${cita.cliente_apellido}`
    }
    return cita.cliente ? `${cita.cliente.nombre} ${cita.cliente.apellido}` : "Cliente desconocido"
  }

  // Obtener nombre del empleado
  const getNombreEmpleado = (cita: Cita): string => {
    if (cita.empleado_nombre && cita.empleado_apellido) {
      return `${cita.empleado_nombre} ${cita.empleado_apellido}`
    }
    return cita.empleado ? `${cita.empleado.nombre} ${cita.empleado.apellido}` : "Empleado desconocido"
  }

  // Obtener nombres de servicios
  const getNombresServicios = (cita: Cita): string => {
    if (cita.servicios && cita.servicios.length > 0) {
      return cita.servicios.map((cs) => cs.nombre || cs.servicio?.nombre || "Servicio").join(", ")
    }
    return "Sin servicios"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando citas...</span>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar citas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Estado</h4>
                  <Select
                    value={filtroEstado}
                    onValueChange={(value) => setFiltroEstado(value as EstadoCita | "todos")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      {estadosCita.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Fecha</h4>
                  <Select
                    value={filtroFecha}
                    onValueChange={(value) => setFiltroFecha(value as "hoy" | "semana" | "mes" | "todos")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las fechas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las fechas</SelectItem>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="semana">Próxima semana</SelectItem>
                      <SelectItem value="mes">Próximo mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            <Link href="/dashboard/citas/nueva">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nueva Cita</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead>Barbero</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {citasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron citas
                </TableCell>
              </TableRow>
            ) : (
              citasFiltradas
                .sort((a, b) => {
                  // Ordenar por fecha y hora
                  const dateA = new Date(`${a.fecha}T${a.hora_inicio}`)
                  const dateB = new Date(`${b.fecha}T${b.hora_inicio}`)
                  return dateA.getTime() - dateB.getTime()
                })
                .map((cita) => (
                  <TableRow key={cita.id}>
                    <TableCell>
                      <div className="font-medium">
                        {(() => {
                          if (cita.fecha) {
                            debugFecha(cita.fecha) // Temporal para debugging
                            return formatFecha(cita.fecha)
                          } else {
                            console.error("Cita sin fecha:", cita)
                            return "Sin fecha"
                          }
                        })()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatHora(cita.hora_inicio)} - {formatHora(cita.hora_fin)}
                      </div>
                    </TableCell>
                    <TableCell>{getNombreCliente(cita)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{getNombresServicios(cita)}</TableCell>
                    <TableCell>{getNombreEmpleado(cita)}</TableCell>
                    <TableCell>
                      <Badge className={getColorEstado(cita.estado)}>
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1).replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrecio(cita.precio_total)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver detalles">
                          <Link href={`/dashboard/citas/${cita.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                          <Link href={`/dashboard/citas/${cita.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(cita)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!citaToDelete} onOpenChange={(open) => !open && setCitaToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCitaToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
