"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { Cita, Empleado } from "@/lib/api-client"
import { ChevronLeft, ChevronRight, Clock, User, Scissors, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CitasCalendario() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [citasDelDia, setCitasDelDia] = useState<Cita[]>([])
  const [todasLasCitas, setTodasLasCitas] = useState<Cita[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoFiltro, setEmpleadoFiltro] = useState<string>("todos")
  const [month, setMonth] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [loadingDia, setLoadingDia] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar citas y empleados en paralelo
        const [citasResponse, empleadosResponse] = await Promise.all([
          apiClient.getCitas(),
          apiClient.getEmpleadosActivos(),
        ])

        if (citasResponse.success && citasResponse.data) {
          setTodasLasCitas(citasResponse.data)
        } else {
          throw new Error(citasResponse.error || "Error al cargar citas")
        }

        if (empleadosResponse.success && empleadosResponse.data) {
          setEmpleados(empleadosResponse.data)
        } else {
          console.warn("Error al cargar empleados:", empleadosResponse.error)
          setEmpleados([])
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del calendario",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  // Formatear fecha a YYYY-MM-DD (mejorado para manejar zona horaria)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Función para normalizar fecha de string a YYYY-MM-DD (MEJORADA)
  const normalizarFecha = (fecha: string): string => {
    try {
      console.log("=== NORMALIZAR FECHA ===")
      console.log("Fecha original:", fecha)
      console.log("Tipo:", typeof fecha)

      if (!fecha || typeof fecha !== "string") {
        console.log("❌ Fecha inválida o no es string")
        return ""
      }

      let fechaLimpia = fecha

      // Si es formato ISO (contiene T), extraer solo la parte de fecha
      if (fecha.includes("T")) {
        fechaLimpia = fecha.split("T")[0]
        console.log("📅 Formato ISO detectado, fecha extraída:", fechaLimpia)
      }

      // Validar formato YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaLimpia)) {
        console.log("❌ Formato no válido después de limpiar:", fechaLimpia)

        // Intentar convertir usando Date
        const date = new Date(fecha)
        if (!isNaN(date.getTime())) {
          fechaLimpia = formatDate(date)
          console.log("🔄 Convertido usando Date:", fechaLimpia)
        } else {
          console.log("❌ No se pudo convertir la fecha")
          return ""
        }
      }

      console.log("✅ Fecha normalizada:", fechaLimpia)
      return fechaLimpia
    } catch (error) {
      console.error("❌ Error normalizando fecha:", fecha, error)
      return ""
    }
  }

  // Función para obtener fechas con citas para resaltarlas en el calendario
  const fechasConCitas = todasLasCitas.reduce((acc: Record<string, number>, cita) => {
    // Filtrar por empleado si está seleccionado
    if (empleadoFiltro !== "todos" && cita.empleado_id !== empleadoFiltro) {
      return acc
    }

    // Solo contar citas no canceladas
    if (cita.estado === "cancelada") {
      return acc
    }

    const fechaNormalizada = normalizarFecha(cita.fecha)

    if (fechaNormalizada) {
      if (!acc[fechaNormalizada]) {
        acc[fechaNormalizada] = 0
      }
      acc[fechaNormalizada]++
    }

    return acc
  }, {})

  // Cargar citas del día seleccionado
  useEffect(() => {
    const cargarCitasDelDia = async () => {
      if (!selectedDate) return

      try {
        setLoadingDia(true)
        const fechaFormateada = formatDate(selectedDate)

        console.log("=== FILTRAR CITAS DEL DÍA ===")
        console.log("Fecha seleccionada:", fechaFormateada)
        console.log("Total de citas cargadas:", todasLasCitas.length)

        // Filtrar citas del día desde las citas ya cargadas
        let citasFiltradas = todasLasCitas.filter((cita) => {
          const fechaCitaNormalizada = normalizarFecha(cita.fecha)
          const coincide = fechaCitaNormalizada === fechaFormateada

          console.log(`Cita ${cita.id.slice(0, 8)}:`, {
            fechaOriginal: cita.fecha,
            fechaNormalizada: fechaCitaNormalizada,
            fechaBuscada: fechaFormateada,
            coincide: coincide,
          })

          return coincide
        })

        console.log("Citas encontradas antes de filtro empleado:", citasFiltradas.length)

        // Aplicar filtro de empleado
        if (empleadoFiltro !== "todos") {
          citasFiltradas = citasFiltradas.filter((cita) => cita.empleado_id === empleadoFiltro)
          console.log("Citas después de filtro empleado:", citasFiltradas.length)
        }

        console.log("Citas finales para mostrar:", citasFiltradas)
        setCitasDelDia(citasFiltradas)
      } catch (error) {
        console.error("Error cargando citas del día:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas del día",
          variant: "destructive",
        })
      } finally {
        setLoadingDia(false)
      }
    }

    cargarCitasDelDia()
  }, [selectedDate, empleadoFiltro, todasLasCitas])

  // Formatear hora de 24h a 12h
  const formatHora = (hora: string): string => {
    const [h, m] = hora.split(":")
    const hour = Number.parseInt(h)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  // Obtener nombre del cliente desde los datos de la cita
  const getNombreCliente = (cita: Cita): string => {
    if (cita.cliente_nombre && cita.cliente_apellido) {
      return `${cita.cliente_nombre} ${cita.cliente_apellido}`
    }
    return "Cliente desconocido"
  }

  // Obtener nombre del empleado desde los datos de la cita
  const getNombreEmpleado = (cita: Cita): string => {
    if (cita.empleado_nombre && cita.empleado_apellido) {
      return `${cita.empleado_nombre} ${cita.empleado_apellido}`
    }
    return "Empleado desconocido"
  }

  // Obtener nombres de servicios desde los datos de la cita
  const getNombresServicios = (cita: Cita): string => {
    if (cita.servicios && cita.servicios.length > 0) {
      return cita.servicios.map((servicio) => servicio.nombre || "Servicio").join(", ")
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

  // Navegar al mes anterior
  const prevMonth = () => {
    const date = new Date(month)
    date.setMonth(date.getMonth() - 1)
    setMonth(date)
  }

  // Navegar al mes siguiente
  const nextMonth = () => {
    const date = new Date(month)
    date.setMonth(date.getMonth() + 1)
    setMonth(date)
  }

  // Navegar al mes actual
  const currentMonth = () => {
    setMonth(new Date())
    setSelectedDate(new Date())
  }

  // Recargar datos
  const recargarDatos = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getCitas()
      if (response.success && response.data) {
        setTodasLasCitas(response.data)
        toast({
          title: "Datos actualizados",
          description: "Las citas se han actualizado correctamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar el calendario</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={recargarDatos}>Reintentar</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={currentMonth}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              className="rounded-md border"
              modifiers={{
                hasCitas: (date) => {
                  const dateStr = formatDate(date)
                  return !!fechasConCitas[dateStr]
                },
              }}
              modifiersClassNames={{
                hasCitas: "bg-[#e6f0f9] font-bold text-[#1a3b5d]",
              }}
              components={{
                DayContent: ({ date }) => {
                  const dateStr = formatDate(date)
                  const count = fechasConCitas[dateStr]
                  return (
                    <div className="relative">
                      <div>{date.getDate()}</div>
                      {count > 0 && (
                        <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#1a3b5d]"></div>
                      )}
                    </div>
                  )
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por barbero</label>
              <Select value={empleadoFiltro} onValueChange={setEmpleadoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los barberos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los barberos</SelectItem>
                  {empleados.map((empleado) => (
                    <SelectItem key={empleado.id} value={empleado.id}>
                      {empleado.nombre} {empleado.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de citas</span>
                <Badge variant="outline">{todasLasCitas.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Este mes</span>
                <Badge variant="outline">
                  {
                    todasLasCitas.filter((cita) => {
                      const citaDate = new Date(cita.fecha)
                      return citaDate.getMonth() === month.getMonth() && citaDate.getFullYear() === month.getFullYear()
                    }).length
                  }
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={recargarDatos} className="w-full mt-2">
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="mb-4 text-xl font-semibold text-[#1a3b5d]">
            Citas para el{" "}
            {selectedDate?.toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>

          {loadingDia ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : citasDelDia.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 text-center">
              <p className="text-gray-500">No hay citas programadas para este día</p>
              <Button asChild className="mt-4 bg-[#1a3b5d] hover:bg-[#2a4b6d]">
                <Link href="/dashboard/citas/nueva">
                  <Plus className="mr-2 h-4 w-4" />
                  Programar cita
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {citasDelDia
                .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                .map((cita) => (
                  <div
                    key={cita.id}
                    className="cursor-pointer rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                    onClick={() => router.push(`/dashboard/citas/${cita.id}`)}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatHora(cita.hora_inicio)} - {formatHora(cita.hora_fin)}
                        </span>
                      </div>
                      <Badge className={getColorEstado(cita.estado)}>
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{getNombreCliente(cita)}</span>
                      </div>
                      <div className="flex items-center">
                        <Scissors className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="truncate">{getNombresServicios(cita)}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d]">
                          {getNombreEmpleado(cita)}
                        </Badge>
                      </div>
                    </div>

                    {cita.notas && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Notas:</strong> {cita.notas}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Total: $
                        {typeof cita.precio_total === "number"
                          ? cita.precio_total.toFixed(2)
                          : Number.parseFloat(cita.precio_total || "0").toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">ID: {cita.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
