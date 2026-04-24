"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft, Package, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"

interface DevolucionPageProps {
  params: Promise<{ id: string }>
}

export default function DevolucionPage({ params }: DevolucionPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [transaccion, setTransaccion] = useState<any>(null)
  const [productosDevolucion, setProductosDevolucion] = useState<any[]>([])
  const [motivo, setMotivo] = useState("")
  const [observaciones, setObservaciones] = useState("")

  // Cargar datos de la transacción
  useEffect(() => {
    const cargarTransaccion = async () => {
      try {
        setLoading(true)
        const response = await apiClient.request<any>(`/api/pagos/${resolvedParams.id}`)

        if (response.success && response.data) {
          const data = response.data
          setTransaccion(data)

          // Solo permitir devoluciones para ventas
          if (data.tipo !== "venta") {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Solo se pueden hacer devoluciones de ventas de productos",
            })
            router.push(`/dashboard/pagos/${resolvedParams.id}`)
            return
          }

          // Inicializar productos para devolución
          if (data.productos) {
            setProductosDevolucion(
              data.productos.map((producto: any) => ({
                ...producto,
                cantidad_devolver: 0,
                seleccionado: false,
              })),
            )
          }
        } else {
          throw new Error(response.error || "Transacción no encontrada")
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
  }, [resolvedParams.id, router, toast])

  // Manejar selección de producto
  const handleProductoSeleccion = (index: number, seleccionado: boolean) => {
    setProductosDevolucion((prev) =>
      prev.map((producto, i) =>
        i === index
          ? {
              ...producto,
              seleccionado,
              cantidad_devolver: seleccionado ? 1 : 0,
            }
          : producto,
      ),
    )
  }

  // Manejar cambio de cantidad
  const handleCantidadChange = (index: number, cantidad: number) => {
    setProductosDevolucion((prev) =>
      prev.map((producto, i) =>
        i === index ? { ...producto, cantidad_devolver: Math.min(cantidad, producto.cantidad) } : producto,
      ),
    )
  }

  // Calcular total de devolución
  const calcularTotalDevolucion = () => {
    return productosDevolucion
      .filter((p) => p.seleccionado && p.cantidad_devolver > 0)
      .reduce((total, producto) => total + producto.precio_unitario * producto.cantidad_devolver, 0)
  }

  // Procesar devolución
  const handleProcesarDevolucion = async () => {
    try {
      const productosADevolver = productosDevolucion.filter((p) => p.seleccionado && p.cantidad_devolver > 0)

      if (productosADevolver.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debe seleccionar al menos un producto para devolver",
        })
        return
      }

      if (!motivo.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debe especificar el motivo de la devolución",
        })
        return
      }

      setSubmitting(true)

      const devolucionData = {
        venta_id: resolvedParams.id,
        productos: productosADevolver.map((p) => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad_devolver,
          precio_unitario: p.precio_unitario,
        })),
        motivo,
        observaciones,
        total: calcularTotalDevolucion(),
      }

      const response = await apiClient.request("/api/devoluciones", {
        method: "POST",
        body: JSON.stringify(devolucionData),
      })

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Devolución procesada correctamente",
        })
        router.push(`/dashboard/pagos/${resolvedParams.id}`)
      } else {
        throw new Error(response.error || "Error al procesar la devolución")
      }
    } catch (error) {
      console.error("Error procesando devolución:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar la devolución",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
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

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(precio)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/pagos/${resolvedParams.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a detalles
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos a Devolver
              </CardTitle>
              <CardDescription>Seleccione los productos y cantidades que desea devolver</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad Comprada</TableHead>
                    <TableHead className="text-center">Cantidad a Devolver</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosDevolucion.map((producto, index) => (
                    <TableRow key={producto.producto_id}>
                      <TableCell>
                        <Checkbox
                          checked={producto.seleccionado}
                          onCheckedChange={(checked) => handleProductoSeleccion(index, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{producto.producto_nombre}</div>
                      </TableCell>
                      <TableCell className="text-center">{producto.cantidad}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max={producto.cantidad}
                          value={producto.cantidad_devolver}
                          onChange={(e) => handleCantidadChange(index, Number.parseInt(e.target.value) || 0)}
                          disabled={!producto.seleccionado}
                          className="w-20 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-right">{formatPrecio(producto.precio_unitario)}</TableCell>
                      <TableCell className="text-right">
                        {formatPrecio(producto.precio_unitario * producto.cantidad_devolver)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Devolución</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="motivo">Motivo de la Devolución *</Label>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producto_defectuoso">Producto defectuoso</SelectItem>
                    <SelectItem value="no_satisface">No satisface expectativas</SelectItem>
                    <SelectItem value="error_pedido">Error en el pedido</SelectItem>
                    <SelectItem value="cambio_opinion">Cambio de opinión</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles adicionales sobre la devolución..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Total a devolver:</span>
                  <span className="text-lg font-bold">{formatPrecio(calcularTotalDevolucion())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Importante
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• La devolución restaurará el stock de los productos</p>
              <p>• El reembolso se procesará por el mismo método de pago</p>
              <p>• Esta acción no se puede deshacer</p>
            </CardContent>
          </Card>

          <Button
            onClick={handleProcesarDevolucion}
            disabled={submitting || calcularTotalDevolucion() === 0}
            className="w-full bg-[#1a3b5d] hover:bg-[#2a4b6d]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Procesar Devolución"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
