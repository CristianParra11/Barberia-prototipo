"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import type { Cliente, Empleado, Producto, Servicio, Cita } from "@/lib/api-client"
import { Loader2, Calendar, Clock, Scissors, ShoppingBag } from "lucide-react"
import gsap from "gsap"

const metodosPago = ["efectivo", "tarjeta", "transferencia"]

interface RegistroPagoFormProps {
  pago?: any
}

export default function RegistroPagoForm({ pago }: RegistroPagoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const formRef = useRef(null)
  const [activeTab, setActiveTab] = useState("servicio")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  // Datos de las APIs
  const [citas, setCitas] = useState<Cita[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])

  // Estado del formulario para servicios
  const [formDataServicio, setFormDataServicio] = useState({
    citaId: "",
    clienteId: "",
    empleadoId: "",
    servicioIds: [] as string[],
    metodoPago: "efectivo",
    total: 0,
    descuento: 0,
    totalConDescuento: 0,
    notas: "",
  })

  // Estado del formulario para ventas
  const [formDataVenta, setFormDataVenta] = useState({
    clienteId: "",
    empleadoId: "",
    productos: [] as { producto_id: string; cantidad: number; precio_unitario: number }[],
    metodoPago: "efectivo",
    total: 0,
    descuento: 0,
    totalConDescuento: 0,
    notas: "",
  })

  // Estado para productos seleccionados
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    {
      id: string
      cantidad: number
      precio: number
    }[]
  >([])

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)

        const [citasRes, clientesRes, empleadosRes, productosRes, serviciosRes] = await Promise.all([
          apiClient.getCitas(),
          apiClient.getClientes(),
          apiClient.getEmpleados(),
          apiClient.getProductos(),
          apiClient.getServicios(),
        ])

        if (citasRes.success && citasRes.data) {
          // Filtrar solo citas programadas
          const citasProgramadas = citasRes.data.filter((cita) => cita.estado === "programada")
          setCitas(citasProgramadas)
        }

        if (clientesRes.success && clientesRes.data) {
          setClientes(clientesRes.data)
        }

        if (empleadosRes.success && empleadosRes.data) {
          const empleadosActivos = empleadosRes.data.filter((emp) => emp.estado === "activo")
          setEmpleados(empleadosActivos)
        }

        if (productosRes.success && productosRes.data) {
          const productosActivos = productosRes.data.filter((prod) => prod.estado === "activo")
          setProductos(productosActivos)
        }

        if (serviciosRes.success && serviciosRes.data) {
          const serviciosActivos = serviciosRes.data.filter((serv) => serv.estado === "activo")
          setServicios(serviciosActivos)
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al cargar los datos necesarios",
        })
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [toast])

  useEffect(() => {
    // Animación de entrada
    if (!loading) {
      gsap.from(formRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }, [loading])

  // Calcular total de venta
  useEffect(() => {
    const total = productosSeleccionados.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    setFormDataVenta((prev) => ({ ...prev, total }))
  }, [productosSeleccionados])

  // Calcular total con descuento para servicios
  useEffect(() => {
    const totalConDescuento = formDataServicio.total * (1 - formDataServicio.descuento / 100)
    setFormDataServicio((prev) => ({ ...prev, totalConDescuento }))
  }, [formDataServicio.total, formDataServicio.descuento])

  // Calcular total con descuento para ventas
  useEffect(() => {
    const totalConDescuento = formDataVenta.total * (1 - formDataVenta.descuento / 100)
    setFormDataVenta((prev) => ({ ...prev, totalConDescuento }))
  }, [formDataVenta.total, formDataVenta.descuento])

  // Manejar cambio de cita seleccionada
  const handleCitaChange = (citaId: string) => {
    if (citaId === "no-cita") {
      // Si selecciona "servicio sin cita previa", resetear los campos excepto el método de pago
      setFormDataServicio((prev) => ({
        ...prev,
        citaId: "no-cita", // Set to "no-cita" instead of empty string
        clienteId: "",
        empleadoId: "",
        servicioIds: [],
        total: 0,
      }))
    } else {
      const cita = citas.find((c) => c.id === citaId)
      if (cita) {
        setFormDataServicio({
          ...formDataServicio,
          citaId,
          clienteId: cita.cliente_id,
          empleadoId: cita.empleado_id,
          servicioIds: cita.servicios?.map((s) => s.servicio_id) || [],
          total: cita.precio_total,
        })
      }
    }
  }

  // Manejar cambio en productos
  const handleProductoChange = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setProductosSeleccionados((prev) => prev.filter((item) => item.id !== productoId))
      setFormDataVenta((prev) => ({
        ...prev,
        productos: prev.productos.filter((p) => p.producto_id !== productoId),
      }))
      return
    }

    const producto = productos.find((p) => p.id === productoId)
    if (!producto) return

    const existeProducto = productosSeleccionados.find((item) => item.id === productoId)

    if (existeProducto) {
      setProductosSeleccionados((prev) => prev.map((item) => (item.id === productoId ? { ...item, cantidad } : item)))
    } else {
      setProductosSeleccionados((prev) => [...prev, { id: productoId, cantidad, precio: producto.precio }])
    }

    // Actualizar formDataVenta.productos
    setFormDataVenta((prev) => {
      const nuevosProductos = [...prev.productos]
      const index = nuevosProductos.findIndex((p) => p.producto_id === productoId)

      if (index >= 0) {
        nuevosProductos[index] = {
          ...nuevosProductos[index],
          cantidad,
        }
      } else {
        nuevosProductos.push({
          producto_id: productoId,
          cantidad,
          precio_unitario: producto.precio,
        })
      }

      return {
        ...prev,
        productos: nuevosProductos,
      }
    })
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmDialog(true)
  }

  // Función para manejar la confirmación y enviar los datos
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      if (activeTab === "servicio") {
        // Crear pago de servicio
        const servicioData = {
          tipo: "servicio",
          cliente_id: formDataServicio.clienteId === "no-registrado" ? null : formDataServicio.clienteId,
          empleado_id: formDataServicio.empleadoId,
          servicio_ids: formDataServicio.servicioIds,
          metodo_pago: formDataServicio.metodoPago,
          total: formDataServicio.descuento > 0 ? formDataServicio.totalConDescuento : formDataServicio.total,
          descuento: formDataServicio.descuento,
          notas: formDataServicio.notas,
          cita_id: formDataServicio.citaId || "no-cita",
        }

        console.log("Enviando datos de servicio:", servicioData)

        const response = await apiClient.request("/api/pagos", {
          method: "POST",
          body: JSON.stringify(servicioData),
        })

        if (!response.success) {
          throw new Error(response.error || "Error al registrar el pago de servicio")
        }
      } else {
        // Crear venta
        const ventaData = {
          tipo: "venta",
          cliente_id: formDataVenta.clienteId === "no-registrado" ? null : formDataVenta.clienteId,
          empleado_id: formDataVenta.empleadoId,
          productos: formDataVenta.productos,
          metodo_pago: formDataVenta.metodoPago,
          descuento: formDataVenta.descuento,
          notas: formDataVenta.notas,
        }

        console.log("Enviando datos de venta:", ventaData)

        const response = await apiClient.request("/api/pagos", {
          method: "POST",
          body: JSON.stringify(ventaData),
        })

        if (!response.success) {
          throw new Error(response.error || "Error al crear la venta")
        }
      }

      // Mostrar animación de éxito
      gsap.to(formRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => {
          toast({
            title: "Pago registrado",
            description: "El pago ha sido registrado correctamente.",
          })

          // Redirigir a la lista de pagos
          router.push("/dashboard/pagos")
        },
      })
    } catch (error) {
      console.error("Error registrando pago:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al registrar el pago.",
      })
      setIsSubmitting(false)
    }
  }

  const getServicioNombre = (id: string) => {
    const servicio = servicios.find((s) => s.id === id)
    return servicio ? servicio.nombre : "Servicio no encontrado"
  }

  // Formatear precio
  const formatPrecio = (precio: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(precio)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <Tabs defaultValue="servicio" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="servicio" className="flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Pago de Servicios
          </TabsTrigger>
          <TabsTrigger value="venta" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Venta de Productos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servicio">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Servicio</CardTitle>
                <CardDescription>Selecciona una cita programada o registra un servicio directo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="citaId">Cita Programada</Label>
                  <Select value={formDataServicio.citaId} onValueChange={handleCitaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cita" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-cita">Servicio sin cita previa</SelectItem>
                      {citas.map((cita) => {
                        const cliente = clientes.find((c) => c.id === cita.cliente_id)
                        const fecha = new Date(cita.fecha)

                        return (
                          <SelectItem key={cita.id} value={cita.id}>
                            {fecha.toLocaleDateString()} {cita.hora_inicio} -{" "}
                            {cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cliente"}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {(formDataServicio.citaId === "no-cita" || formDataServicio.citaId === "") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="clienteId">Cliente</Label>
                      <Select
                        value={formDataServicio.clienteId}
                        onValueChange={(value) => setFormDataServicio({ ...formDataServicio, clienteId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-registrado">Cliente no registrado</SelectItem>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nombre} {cliente.apellido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="empleadoId">Barbero</Label>
                      <Select
                        value={formDataServicio.empleadoId}
                        onValueChange={(value) => setFormDataServicio({ ...formDataServicio, empleadoId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un barbero" />
                        </SelectTrigger>
                        <SelectContent>
                          {empleados.map((empleado) => (
                            <SelectItem key={empleado.id} value={empleado.id}>
                              {empleado.nombre} {empleado.apellido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Servicios</Label>
                      <div className="rounded-md border border-gray-200 p-4">
                        <div className="space-y-3">
                          {servicios.map((servicio) => {
                            const isSelected = formDataServicio.servicioIds.includes(servicio.id)

                            return (
                              <div key={servicio.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`servicio-${servicio.id}`}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const newServicioIds = e.target.checked
                                        ? [...formDataServicio.servicioIds, servicio.id]
                                        : formDataServicio.servicioIds.filter((id) => id !== servicio.id)

                                      // Calcular nuevo total
                                      const nuevoTotal = servicios
                                        .filter((s) => newServicioIds.includes(s.id))
                                        .reduce((sum, s) => sum + s.precio, 0)

                                      setFormDataServicio({
                                        ...formDataServicio,
                                        servicioIds: newServicioIds,
                                        total: nuevoTotal,
                                      })
                                    }}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <label htmlFor={`servicio-${servicio.id}`} className="text-sm">
                                    {servicio.nombre} ({servicio.duracion} min)
                                  </label>
                                </div>
                                <span className="text-sm font-medium">{formatPrecio(servicio.precio)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {formDataServicio.citaId && formDataServicio.citaId !== "no-cita" && (
                  <div className="rounded-md bg-blue-50 p-4 text-blue-800">
                    <h4 className="mb-2 font-medium">Detalles de la cita seleccionada</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            citas.find((c) => c.id === formDataServicio.citaId)?.fecha || "",
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {citas.find((c) => c.id === formDataServicio.citaId)?.hora_inicio} -
                          {citas.find((c) => c.id === formDataServicio.citaId)?.hora_fin}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        <span>
                          {formDataServicio.servicioIds
                            .map((id) => servicios.find((s) => s.id === id)?.nombre)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles del Pago</CardTitle>
                <CardDescription>Completa la información del pago</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total">Total a Pagar</Label>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      id="total"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formDataServicio.total}
                      onChange={(e) =>
                        setFormDataServicio({
                          ...formDataServicio,
                          total: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descuento">Descuento (%)</Label>
                  <div className="flex items-center">
                    <Input
                      id="descuento"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={formDataServicio.descuento}
                      onChange={(e) =>
                        setFormDataServicio({
                          ...formDataServicio,
                          descuento: Math.min(100, Number.parseFloat(e.target.value) || 0),
                        })
                      }
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>

                {formDataServicio.descuento > 0 && (
                  <div className="rounded-md bg-green-50 p-3">
                    <div className="flex items-center justify-between text-green-800">
                      <span>Total con descuento:</span>
                      <span className="font-bold">{formatPrecio(formDataServicio.totalConDescuento)}</span>
                    </div>
                    <div className="text-xs text-green-600">
                      Ahorro: {formatPrecio(formDataServicio.total - formDataServicio.totalConDescuento)}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <RadioGroup
                    value={formDataServicio.metodoPago}
                    onValueChange={(value) =>
                      setFormDataServicio({
                        ...formDataServicio,
                        metodoPago: value,
                      })
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {metodosPago.map((metodo) => (
                      <div key={metodo} className="flex items-center space-x-2">
                        <RadioGroupItem value={metodo} id={`metodo-${metodo}`} />
                        <Label htmlFor={`metodo-${metodo}`} className="capitalize">
                          {metodo}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas adicionales</Label>
                  <Textarea
                    id="notas"
                    placeholder="Añade cualquier información relevante sobre el pago"
                    value={formDataServicio.notas}
                    onChange={(e) =>
                      setFormDataServicio({
                        ...formDataServicio,
                        notas: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="venta">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Selecciona los productos para la venta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente</Label>
                  <Select
                    value={formDataVenta.clienteId}
                    onValueChange={(value) => setFormDataVenta({ ...formDataVenta, clienteId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-registrado">Cliente no registrado</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empleadoId">Vendedor</Label>
                  <Select
                    value={formDataVenta.empleadoId}
                    onValueChange={(value) => setFormDataVenta({ ...formDataVenta, empleadoId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {empleados.map((empleado) => (
                        <SelectItem key={empleado.id} value={empleado.id}>
                          {empleado.nombre} {empleado.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Productos</Label>
                  <div className="rounded-md border border-gray-200 p-4">
                    <div className="max-h-[300px] space-y-3 overflow-y-auto">
                      {productos.map((producto) => {
                        const productoSeleccionado = productosSeleccionados.find((item) => item.id === producto.id)
                        const cantidad = productoSeleccionado?.cantidad || 0

                        return (
                          <div key={producto.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{producto.nombre}</p>
                              <p className="text-sm text-gray-500">
                                {producto.categoria} | Stock: {producto.stock}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{formatPrecio(producto.precio)}</span>
                              <div className="flex w-24 items-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => handleProductoChange(producto.id, Math.max(0, cantidad - 1))}
                                  disabled={cantidad === 0}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  min="0"
                                  max={producto.stock}
                                  value={cantidad}
                                  onChange={(e) =>
                                    handleProductoChange(
                                      producto.id,
                                      Math.min(producto.stock, Number.parseInt(e.target.value) || 0),
                                    )
                                  }
                                  className="h-8 rounded-none border-x-0 text-center"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() =>
                                    handleProductoChange(producto.id, Math.min(producto.stock, cantidad + 1))
                                  }
                                  disabled={cantidad >= producto.stock}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de la Venta</CardTitle>
                <CardDescription>Revisa los productos seleccionados y completa el pago</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {productosSeleccionados.length > 0 ? (
                  <div className="rounded-md border border-gray-200 p-4">
                    <div className="max-h-[200px] space-y-3 overflow-y-auto">
                      {productosSeleccionados.map((item) => {
                        const producto = productos.find((p) => p.id === item.id)
                        if (!producto) return null

                        return (
                          <div key={item.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{producto.nombre}</p>
                              <p className="text-sm text-gray-500">
                                {item.cantidad} x {formatPrecio(item.precio)}
                              </p>
                            </div>
                            <span className="font-medium">{formatPrecio(item.precio * item.cantidad)}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between font-medium">
                        <span>Total</span>
                        <span>{formatPrecio(formDataVenta.total)}</span>
                      </div>

                      <div className="mt-3 space-y-2">
                        <Label htmlFor="descuento-venta">Descuento (%)</Label>
                        <div className="flex items-center">
                          <Input
                            id="descuento-venta"
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={formDataVenta.descuento}
                            onChange={(e) =>
                              setFormDataVenta({
                                ...formDataVenta,
                                descuento: Math.min(100, Number.parseFloat(e.target.value) || 0),
                              })
                            }
                          />
                          <span className="ml-2">%</span>
                        </div>
                      </div>

                      {formDataVenta.descuento > 0 && (
                        <div className="mt-3 rounded-md bg-green-50 p-3">
                          <div className="flex items-center justify-between text-green-800">
                            <span>Total con descuento:</span>
                            <span className="font-bold">{formatPrecio(formDataVenta.totalConDescuento)}</span>
                          </div>
                          <div className="text-xs text-green-600">
                            Ahorro: {formatPrecio(formDataVenta.total - formDataVenta.totalConDescuento)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed border-gray-300 p-4 text-center text-gray-500">
                    <ShoppingBag className="mb-2 h-10 w-10 opacity-20" />
                    <p>No hay productos seleccionados</p>
                    <p className="text-sm">Añade productos para continuar</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <RadioGroup
                    value={formDataVenta.metodoPago}
                    onValueChange={(value) =>
                      setFormDataVenta({
                        ...formDataVenta,
                        metodoPago: value,
                      })
                    }
                    className="flex flex-wrap gap-4"
                  >
                    {metodosPago.map((metodo) => (
                      <div key={metodo} className="flex items-center space-x-2">
                        <RadioGroupItem value={metodo} id={`venta-metodo-${metodo}`} />
                        <Label htmlFor={`venta-metodo-${metodo}`} className="capitalize">
                          {metodo}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas-venta">Notas adicionales</Label>
                  <Textarea
                    id="notas-venta"
                    placeholder="Añade cualquier información relevante sobre la venta"
                    value={formDataVenta.notas}
                    onChange={(e) =>
                      setFormDataVenta({
                        ...formDataVenta,
                        notas: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/pagos")} disabled={isSubmitting}>
          Cancelar
        </Button>

        <Button
          type="submit"
          className="bg-[#1a3b5d] hover:bg-[#2a4b6d]"
          disabled={
            isSubmitting ||
            (activeTab === "servicio" &&
              (formDataServicio.total <= 0 ||
                !formDataServicio.empleadoId ||
                formDataServicio.servicioIds.length === 0)) ||
            (activeTab === "venta" &&
              (formDataVenta.total <= 0 || productosSeleccionados.length === 0 || !formDataVenta.empleadoId))
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>Registrar Pago</>
          )}
        </Button>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmar registro de pago</DialogTitle>
            <DialogDescription>¿Estás seguro de que deseas registrar este pago?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-[#e6f0f9] p-3 text-[#1a3b5d]">
              <p className="font-medium">Detalles del pago:</p>
              {activeTab === "servicio" ? (
                <>
                  <p className="text-sm">
                    Cliente:{" "}
                    {formDataServicio.clienteId
                      ? clientes.find((c) => c.id === formDataServicio.clienteId)?.nombre || "Cliente no registrado"
                      : "Cliente no registrado"}
                  </p>
                  <p className="text-sm">
                    Barbero: {empleados.find((e) => e.id === formDataServicio.empleadoId)?.nombre || "No seleccionado"}
                  </p>
                  <p className="text-sm">
                    Servicios: {formDataServicio.servicioIds.map((id) => getServicioNombre(id)).join(", ")}
                  </p>
                  <p className="text-sm">Total: {formatPrecio(formDataServicio.total)}</p>
                  {formDataServicio.descuento > 0 && (
                    <>
                      <p className="text-sm">Descuento: {formDataServicio.descuento}%</p>
                      <p className="text-sm font-medium">
                        Total con descuento: {formatPrecio(formDataServicio.totalConDescuento)}
                      </p>
                    </>
                  )}
                  <p className="text-sm">Método de pago: {formDataServicio.metodoPago}</p>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    Cliente:{" "}
                    {formDataVenta.clienteId
                      ? clientes.find((c) => c.id === formDataVenta.clienteId)?.nombre || "Cliente no registrado"
                      : "Cliente no registrado"}
                  </p>
                  <p className="text-sm">
                    Vendedor: {empleados.find((e) => e.id === formDataVenta.empleadoId)?.nombre || "No seleccionado"}
                  </p>
                  <p className="text-sm">Productos: {productosSeleccionados.length}</p>
                  <p className="text-sm">Total: {formatPrecio(formDataVenta.total)}</p>
                  {formDataVenta.descuento > 0 && (
                    <>
                      <p className="text-sm">Descuento: {formDataVenta.descuento}%</p>
                      <p className="text-sm font-medium">
                        Total con descuento: {formatPrecio(formDataVenta.totalConDescuento)}
                      </p>
                    </>
                  )}
                  <p className="text-sm">Método de pago: {formDataVenta.metodoPago}</p>
                </>
              )}
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
                  Procesando...
                </>
              ) : (
                <>Confirmar registro</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
