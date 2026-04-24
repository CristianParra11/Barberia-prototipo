"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CalendarIcon, Clock, Search, UserPlus, AlertCircle } from "lucide-react"
import gsap from "gsap"
import { format, isBefore, parseISO, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import ClienteForm from "@/components/dashboard/clientes/cliente-form"
import { formatPrecio } from "@/lib/utils"
import { apiClient, type Cita, type Cliente, type Empleado, type Servicio } from "@/lib/api-client"

interface CitaFormProps {
  cita?: Cita
}

export default function CitaForm({ cita }: CitaFormProps) {
  const isEditing = !!cita
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const formRef = useRef(null)

  // Obtener parámetros de la URL si existen
  const clienteIdParam = searchParams.get("cliente")
  const empleadoIdParam = searchParams.get("empleado")

  // Obtener fecha y hora actual
  const now = new Date()
  const today = startOfDay(now)
  const currentTime = format(now, "HH:mm")

  // Función para crear fecha sin problemas de zona horaria
  const createSafeDate = (dateString?: string): Date => {
    if (dateString) {
      const [year, month, day] = dateString.split("-").map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date()
  }

  // Estado del formulario
  const [formData, setFormData] = useState({
    fecha: cita?.fecha || format(today, "yyyy-MM-dd"),
    hora_inicio: cita?.hora_inicio || "10:00",
    cliente_id: cita?.cliente_id || clienteIdParam || "",
    empleado_id: cita?.empleado_id || empleadoIdParam || "",
    servicio_ids: cita?.servicios?.map((s) => s.servicio_id) || [],
    notas: cita?.notas || "",
  })

  const [horaFin, setHoraFin] = useState(cita?.hora_fin || "")
  const [precioTotal, setPrecioTotal] = useState(cita?.precio_total || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clienteSearch, setClienteSearch] = useState("")
  const [date, setDate] = useState<Date | undefined>(cita ? createSafeDate(cita.fecha) : today)
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])
  const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [citasExistentes, setCitasExistentes] = useState<Cita[]>([])

  // Datos para los selects
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter(
    (cliente) =>
      `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(clienteSearch.toLowerCase()) ||
      (cliente.email && cliente.email.toLowerCase().includes(clienteSearch.toLowerCase())) ||
      cliente.telefono.includes(clienteSearch),
  )

  useEffect(() => {
    setIsMounted(true)
    loadInitialData()
  }, [])

  useEffect(() => {
    if (isMounted && formRef.current) {
      // Animación de entrada
      gsap.from(formRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }, [isMounted])

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      setIsLoading(true)

      const [clientesRes, empleadosRes, serviciosRes, citasRes] = await Promise.all([
        apiClient.getClientes(),
        apiClient.getEmpleados(),
        apiClient.getServicios(),
        apiClient.getCitas(),
      ])

      if (clientesRes.success && clientesRes.data) {
        setClientes(clientesRes.data.filter((c) => c.estado !== "inactivo"))
      }

      if (empleadosRes.success && empleadosRes.data) {
        setEmpleados(empleadosRes.data.filter((e) => e.estado === "activo"))
      }

      if (serviciosRes.success && serviciosRes.data) {
        setServicios(serviciosRes.data.filter((s) => s.estado === "activo"))
      }

      if (citasRes.success && citasRes.data) {
        setCitasExistentes(citasRes.data.filter((c) => c.estado !== "cancelada"))
      }

      // Si estamos editando, cargar datos de la cita
      if (isEditing && cita) {
        await loadCitaData()
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los datos iniciales",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos de la cita para edición
  const loadCitaData = async () => {
    if (!cita?.id) return

    try {
      const response = await apiClient.getCita(cita.id)
      if (response.success && response.data) {
        const citaData = response.data
        setFormData({
          fecha: citaData.fecha,
          hora_inicio: citaData.hora_inicio,
          cliente_id: citaData.cliente_id,
          empleado_id: citaData.empleado_id,
          servicio_ids: citaData.servicios?.map((s) => s.servicio_id) || [],
          notas: citaData.notas || "",
        })
        setHoraFin(citaData.hora_fin)
        setPrecioTotal(citaData.precio_total)
        setDate(createSafeDate(citaData.fecha))
      }
    } catch (error) {
      console.error("Error loading cita data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los datos de la cita",
      })
    }
  }

  // Función para verificar si una hora está disponible
  const isHorarioDisponible = (fecha: string, horaInicio: string, horaFin: string, empleadoId: string): boolean => {
    if (!empleadoId) return true

    const citasDelDia = citasExistentes.filter(
      (cita) =>
        cita.fecha === fecha &&
        cita.empleado_id === empleadoId &&
        cita.estado !== "cancelada" &&
        (!isEditing || cita.id !== cita?.id), // Excluir la cita actual si estamos editando
    )

    // Convertir horas a minutos para facilitar la comparación
    const convertirHoraAMinutos = (hora: string): number => {
      const [horas, minutos] = hora.split(":").map(Number)
      return horas * 60 + minutos
    }

    const inicioMinutos = convertirHoraAMinutos(horaInicio)
    const finMinutos = convertirHoraAMinutos(horaFin)

    // Verificar solapamiento con citas existentes
    return !citasDelDia.some((cita) => {
      const inicioCitaMinutos = convertirHoraAMinutos(cita.hora_inicio)
      const finCitaMinutos = convertirHoraAMinutos(cita.hora_fin)

      // Verificar si hay solapamiento
      return (
        (inicioMinutos >= inicioCitaMinutos && inicioMinutos < finCitaMinutos) ||
        (finMinutos > inicioCitaMinutos && finMinutos <= finCitaMinutos) ||
        (inicioMinutos <= inicioCitaMinutos && finMinutos >= finCitaMinutos)
      )
    })
  }

  // Función para validar fecha y hora
  const validarFechaHora = (fecha: string, hora: string): string | null => {
    const fechaSeleccionada = parseISO(fecha)
    const ahora = new Date()
    const hoy = startOfDay(ahora)

    // Si la fecha es anterior a hoy, no es válida
    if (isBefore(fechaSeleccionada, hoy)) {
      return "No se pueden programar citas en fechas pasadas"
    }

    // Si es hoy, verificar que la hora no sea anterior a la actual
    if (format(fechaSeleccionada, "yyyy-MM-dd") === format(hoy, "yyyy-MM-dd")) {
      const [horaSeleccionada, minutosSeleccionados] = hora.split(":").map(Number)
      const horaActual = ahora.getHours()
      const minutosActuales = ahora.getMinutes()

      const minutosSeleccionadosTotal = horaSeleccionada * 60 + minutosSeleccionados
      const minutosActualesTotal = horaActual * 60 + minutosActuales

      if (minutosSeleccionadosTotal <= minutosActualesTotal) {
        return "No se pueden programar citas en horarios que ya han pasado"
      }
    }

    return null
  }

  // Actualizar hora de fin y precio total cuando cambian los servicios
  useEffect(() => {
    if (formData.servicio_ids.length > 0 && formData.hora_inicio) {
      const serviciosSeleccionados = servicios.filter((s) => formData.servicio_ids.includes(s.id))

      if (serviciosSeleccionados.length > 0) {
        const duracionTotal = apiClient.calcularDuracionTotal(serviciosSeleccionados)
        const nuevaHoraFin = apiClient.calcularHoraFin(formData.hora_inicio, duracionTotal)
        setHoraFin(nuevaHoraFin)

        const nuevoPrecioTotal = apiClient.calcularPrecioTotal(serviciosSeleccionados)
        setPrecioTotal(nuevoPrecioTotal)
      }
    } else {
      setHoraFin("")
      setPrecioTotal(0)
    }
  }, [formData.servicio_ids, formData.hora_inicio, servicios])

  // Actualizar horarios disponibles cuando cambia la fecha o el empleado
  useEffect(() => {
    if (formData.fecha && formData.empleado_id && formData.servicio_ids.length > 0) {
      loadHorariosDisponibles()
    }
  }, [formData.fecha, formData.empleado_id, formData.servicio_ids, citasExistentes])

  // Cargar horarios disponibles
  const loadHorariosDisponibles = async () => {
    if (!formData.fecha || !formData.empleado_id || formData.servicio_ids.length === 0) {
      setHorariosDisponibles([])
      return
    }

    try {
      // Generar horarios base (8:00 AM a 8:00 PM cada 30 minutos)
      const horariosBase = apiClient.generarHorariosDisponibles("08:00", "20:00", 30)

      // Calcular duración total de los servicios seleccionados
      const serviciosSeleccionados = servicios.filter((s) => formData.servicio_ids.includes(s.id))
      const duracionTotal = apiClient.calcularDuracionTotal(serviciosSeleccionados)

      // Filtrar horarios disponibles
      const horariosLibres = horariosBase.filter((hora) => {
        const horaFin = apiClient.calcularHoraFin(hora, duracionTotal)

        // Verificar validación de fecha/hora
        const errorFechaHora = validarFechaHora(formData.fecha, hora)
        if (errorFechaHora) return false

        // Verificar disponibilidad del empleado
        return isHorarioDisponible(formData.fecha, hora, horaFin, formData.empleado_id)
      })

      setHorariosDisponibles(horariosLibres)

      // Si la hora actual no está disponible, limpiar la selección
      if (formData.hora_inicio && !horariosLibres.includes(formData.hora_inicio)) {
        setFormData((prev) => ({ ...prev, hora_inicio: "" }))
        setHoraFin("")
      }
    } catch (error) {
      console.error("Error loading horarios disponibles:", error)
      setHorariosDisponibles([])
    }
  }

  // Actualizar fecha cuando cambia el selector de calendario
  useEffect(() => {
    if (date) {
      // Evitar problemas de zona horaria usando la fecha local
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const fechaFormateada = `${year}-${month}-${day}`

      console.log("Fecha seleccionada en calendario:", date)
      console.log("Fecha formateada para formulario:", fechaFormateada)

      setFormData((prev) => ({ ...prev, fecha: fechaFormateada }))
    }
  }, [date])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleServicioChange = (servicioId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      servicio_ids: checked ? [...prev.servicio_ids, servicioId] : prev.servicio_ids.filter((id) => id !== servicioId),
    }))

    // Limpiar error
    if (errors.servicio_ids) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.servicio_ids
        return newErrors
      })
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validaciones básicas
    if (!formData.fecha) newErrors.fecha = "La fecha es obligatoria"
    if (!formData.hora_inicio) newErrors.hora_inicio = "La hora es obligatoria"
    if (!formData.cliente_id) newErrors.cliente_id = "El cliente es obligatorio"
    if (!formData.empleado_id) newErrors.empleado_id = "El barbero es obligatorio"
    if (formData.servicio_ids.length === 0) newErrors.servicio_ids = "Selecciona al menos un servicio"

    // Validar fecha y hora
    if (formData.fecha && formData.hora_inicio) {
      const errorFechaHora = validarFechaHora(formData.fecha, formData.hora_inicio)
      if (errorFechaHora) {
        newErrors.hora_inicio = errorFechaHora
      }
    }

    // Verificar disponibilidad del empleado
    if (formData.fecha && formData.hora_inicio && horaFin && formData.empleado_id) {
      if (!isHorarioDisponible(formData.fecha, formData.hora_inicio, horaFin, formData.empleado_id)) {
        newErrors.hora_inicio = "El barbero no está disponible en este horario"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Error en el formulario",
        description: "Por favor, corrige los errores antes de continuar.",
      })
      return
    }

    // Mostrar diálogo de confirmación
    setShowConfirmDialog(true)
  }

  // Función para manejar la confirmación y enviar los datos
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      const citaData = {
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        hora_fin: horaFin,
        cliente_id: formData.cliente_id,
        empleado_id: formData.empleado_id,
        servicio_ids: formData.servicio_ids,
        notas: formData.notas,
        precio_total: precioTotal,
      }

      let response
      if (isEditing && cita?.id) {
        response = await apiClient.updateCita(cita.id, citaData)
      } else {
        response = await apiClient.createCita(citaData)
      }

      if (response.success) {
        toast({
          title: isEditing ? "Cita actualizada" : "Cita programada",
          description: isEditing
            ? "La cita ha sido actualizada correctamente."
            : "La cita ha sido programada correctamente.",
        })

        // Redirigir a la lista de citas
        router.push("/dashboard/citas")
      } else {
        throw new Error(response.error || "Error al procesar la cita")
      }
    } catch (error) {
      console.error("Error submitting cita:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error. Inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtener nombre del servicio
  const getServicioNombre = (id: string) => {
    const servicio = servicios.find((s) => s.id === id)
    return servicio ? servicio.nombre : "Servicio desconocido"
  }

  // Manejar la creación de un nuevo cliente
  const handleNuevoClienteSuccess = (nuevoCliente: Cliente) => {
    // Añadir el nuevo cliente a la lista
    setClientes((prev) => [...prev, nuevoCliente])

    // Seleccionar el nuevo cliente
    setFormData((prev) => ({ ...prev, cliente_id: nuevoCliente.id }))

    // Cerrar el modal
    setShowNuevoClienteModal(false)

    toast({
      title: "Cliente añadido",
      description: `${nuevoCliente.nombre} ${nuevoCliente.apellido} ha sido añadido y seleccionado para la cita.`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    )
  }

  if (!isMounted) {
    return (
      <div className="space-y-6 opacity-60">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[400px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm"></div>
          <div className="h-[400px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm"></div>
        </div>
        <div className="flex justify-end space-x-4">
          <div className="h-10 w-24 rounded-md bg-gray-200"></div>
          <div className="h-10 w-32 rounded-md bg-[#1a3b5d]"></div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Fecha y Hora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.fecha && "border-red-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => isBefore(date, today)}
                  />
                </PopoverContent>
              </Popover>
              {errors.fecha && <p className="text-sm text-red-500">{errors.fecha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora</Label>
              <Select
                value={formData.hora_inicio}
                onValueChange={(value) => handleSelectChange("hora_inicio", value)}
                disabled={!formData.empleado_id || !formData.fecha || formData.servicio_ids.length === 0}
              >
                <SelectTrigger className={errors.hora_inicio ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona una hora">
                    {formData.hora_inicio ? (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {formData.hora_inicio}
                      </div>
                    ) : (
                      "Selecciona una hora"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponibles.length === 0 ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      {!formData.empleado_id
                        ? "Selecciona un barbero primero"
                        : formData.servicio_ids.length === 0
                          ? "Selecciona servicios primero"
                          : "No hay horarios disponibles"}
                    </div>
                  ) : (
                    horariosDisponibles.map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {hora}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.hora_inicio && <p className="text-sm text-red-500">{errors.hora_inicio}</p>}
            </div>

            {formData.hora_inicio && horaFin && (
              <div className="rounded-md bg-[#e6f0f9] p-3 text-[#1a3b5d]">
                <p className="font-medium">Duración estimada</p>
                <p>
                  {formData.hora_inicio} - {horaFin}
                </p>
                {formData.empleado_id && (
                  <p className="text-sm mt-1">
                    {isHorarioDisponible(formData.fecha, formData.hora_inicio, horaFin, formData.empleado_id)
                      ? "✅ Horario disponible"
                      : "❌ Horario ocupado"}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notas">Notas adicionales</Label>
              <Textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleTextChange}
                placeholder="Añade cualquier información relevante sobre la cita"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Cliente y Servicios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar cliente por nombre, email o teléfono"
                    className="pl-8"
                    value={clienteSearch}
                    onChange={(e) => setClienteSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Select
                    value={formData.cliente_id}
                    onValueChange={(value) => handleSelectChange("cliente_id", value)}
                  >
                    <SelectTrigger className={errors.cliente_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesFiltrados.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">No se encontraron clientes</div>
                      ) : (
                        clientesFiltrados.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre} {cliente.apellido} - {cliente.telefono}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="ml-2 bg-[#e6f0f9] text-[#1a3b5d] hover:bg-[#d5e5f5]"
                    onClick={() => setShowNuevoClienteModal(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.cliente_id && <p className="text-sm text-red-500">{errors.cliente_id}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empleado_id">Barbero</Label>
              <Select value={formData.empleado_id} onValueChange={(value) => handleSelectChange("empleado_id", value)}>
                <SelectTrigger className={errors.empleado_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecciona un barbero" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((empleado) => (
                    <SelectItem key={empleado.id} value={empleado.id}>
                      {empleado.nombre} {empleado.apellido} - {empleado.puesto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.empleado_id && <p className="text-sm text-red-500">{errors.empleado_id}</p>}
            </div>

            <div className="space-y-2">
              <Label>Servicios</Label>
              <div className="rounded-md border border-gray-200 p-4">
                {errors.servicio_ids && <p className="mb-2 text-sm text-red-500">{errors.servicio_ids}</p>}

                <div className="space-y-3">
                  {servicios.map((servicio) => (
                    <div key={servicio.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`servicio-${servicio.id}`}
                          checked={formData.servicio_ids.includes(servicio.id)}
                          onCheckedChange={(checked) => handleServicioChange(servicio.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`servicio-${servicio.id}`}
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="h-8 w-8 overflow-hidden rounded-md">
                            {servicio.imagen ? (
                              <Image
                                src={servicio.imagen || "/placeholder.svg"}
                                alt={servicio.nombre}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d]">
                                {servicio.nombre.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span>{servicio.nombre}</span>
                            <p className="text-xs text-gray-500">{servicio.duracion} min</p>
                          </div>
                        </label>
                      </div>
                      <span className="font-medium">{formatPrecio(servicio.precio)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {formData.servicio_ids.length > 0 && (
              <div className="rounded-md bg-[#e6f0f9] p-3 text-[#1a3b5d]">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Servicios seleccionados:</p>
                  <p className="font-bold">{formatPrecio(precioTotal)}</p>
                </div>
                <ul className="mt-2 list-inside list-disc">
                  {formData.servicio_ids.map((id) => (
                    <li key={id} className="text-sm">
                      {getServicioNombre(id)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mostrar errores generales */}
      {Object.keys(errors).some((key) => key.startsWith("general_")) && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Errores de validación:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 pl-5">
                  {Object.entries(errors)
                    .filter(([key]) => key.startsWith("general_"))
                    .map(([key, error]) => (
                      <li key={key}>{error}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#1a3b5d] hover:bg-[#2a4b6d]" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Actualizando..." : "Programando..."}
            </>
          ) : (
            <>{isEditing ? "Actualizar Cita" : "Programar Cita"}</>
          )}
        </Button>
      </div>

      {/* Modal para añadir nuevo cliente */}
      <Dialog open={showNuevoClienteModal} onOpenChange={setShowNuevoClienteModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Completa el formulario para añadir un nuevo cliente y programar su cita.
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            isModal={true}
            onSuccess={handleNuevoClienteSuccess}
            onCancel={() => setShowNuevoClienteModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Actualizar cita" : "Programar cita"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "¿Estás seguro de que deseas guardar los cambios realizados en esta cita?"
                : "¿Estás seguro de que deseas programar esta cita?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-[#e6f0f9] p-3 text-[#1a3b5d]">
              <p className="font-medium">Detalles de la cita:</p>
              <p className="text-sm">Fecha: {format(date || new Date(), "PPP", { locale: es })}</p>
              <p className="text-sm">
                Hora: {formData.hora_inicio} - {horaFin}
              </p>
              <p className="text-sm">
                Cliente: {clientes.find((c) => c.id === formData.cliente_id)?.nombre}{" "}
                {clientes.find((c) => c.id === formData.cliente_id)?.apellido}
              </p>
              <p className="text-sm">
                Barbero: {empleados.find((e) => e.id === formData.empleado_id)?.nombre}{" "}
                {empleados.find((e) => e.id === formData.empleado_id)?.apellido}
              </p>
              <p className="text-sm">
                Servicios: {formData.servicio_ids.map((id) => getServicioNombre(id)).join(", ")}
              </p>
              <p className="text-sm">Total: {formatPrecio(precioTotal)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmedSubmit} className="bg-[#1a3b5d] hover:bg-[#2a4b6d]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Actualizando..." : "Programando..."}
                </>
              ) : (
                <>{isEditing ? "Confirmar actualización" : "Confirmar programación"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
