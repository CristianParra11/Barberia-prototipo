"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Building, Mail, MapPin, Package, Pencil, Phone, Trash2, User, Loader2 } from "lucide-react"
import { apiClient, type Proveedor, type Producto } from "@/lib/api-client"

interface ProveedorDetalleProps {
  proveedorId: string
}

export default function ProveedorDetalle({ proveedorId }: ProveedorDetalleProps) {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingProductos, setIsLoadingProductos] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar datos del proveedor
  const cargarProveedor = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getProveedor(proveedorId)

      if (response.success && response.data) {
        setProveedor(response.data)
      } else {
        throw new Error(response.error || "Proveedor no encontrado")
      }
    } catch (error) {
      console.error("Error cargando proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del proveedor",
        variant: "destructive",
      })
      router.push("/dashboard/proveedores")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar productos del proveedor
  const cargarProductos = async () => {
    try {
      setIsLoadingProductos(true)
      const response = await apiClient.getProductos()

      if (response.success && response.data) {
        // Filtrar productos por proveedor
        const productosProveedor = response.data.filter((producto) => producto.proveedor_id === proveedorId)
        setProductos(productosProveedor)
      }
    } catch (error) {
      console.error("Error cargando productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos del proveedor",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProductos(false)
    }
  }

  useEffect(() => {
    cargarProveedor()
    cargarProductos()
  }, [proveedorId])

  const handleDelete = async () => {
    if (!proveedor) return

    setIsDeleting(true)
    try {
      const response = await apiClient.deleteProveedor(proveedor.id)

      if (response.success) {
        toast({
          title: "Proveedor eliminado",
          description: response.message || `${proveedor.nombre} ha sido eliminado correctamente.`,
        })
        router.push("/dashboard/proveedores")
      } else {
        throw new Error(response.error || "Error al eliminar proveedor")
      }
    } catch (error) {
      console.error("Error eliminando proveedor:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el proveedor",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  const formatPrecio = (precio: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(precio)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center">
          <div className="mr-4 h-9 w-24 animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-6 w-48 animate-pulse rounded-md bg-gray-200"></div>
                  <div className="mt-2 h-5 w-24 animate-pulse rounded-md bg-gray-200"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-24 animate-pulse rounded-md bg-gray-200"></div>
                  <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200"></div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 h-5 w-5 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="w-full">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200"></div>
                      <div className="mt-1 h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="h-6 w-32 animate-pulse rounded-md bg-gray-200"></div>
              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-32 animate-pulse rounded-md bg-gray-200"></div>
                    <div className="h-4 w-16 animate-pulse rounded-md bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Proveedor no encontrado</h2>
          <p className="mt-2 text-gray-600">El proveedor que buscas no existe o ha sido eliminado.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/proveedores">Volver a proveedores</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/proveedores">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-[#1a3b5d]">Detalles del Proveedor</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{proveedor.nombre}</CardTitle>
                <CardDescription>
                  <Badge
                    variant={proveedor.estado === "activo" ? "default" : "secondary"}
                    className={
                      proveedor.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }
                  >
                    {proveedor.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/proveedores/${proveedor.id}/editar`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Building className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Empresa</p>
                    <p>{proveedor.nombre}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contacto</p>
                    <p>{proveedor.contacto}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p>{proveedor.telefono}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{proveedor.email || "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dirección</p>
                    <p>{proveedor.direccion || "No especificada"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Productos suministrados</p>
                    <p>{productos.length} productos</p>
                  </div>
                </div>
              </div>
            </div>

            {proveedor.notas && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-500">Notas</p>
                <p className="rounded-md bg-gray-50 p-3 text-sm">{proveedor.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total de productos:</span>
                <span className="font-medium">{productos.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Productos activos:</span>
                <span className="font-medium">{productos.filter((p) => p.estado === "activo").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Valor de inventario:</span>
                <span className="font-medium">
                  {formatPrecio(
                    productos.reduce((total, producto) => total + producto.precio_compra * producto.stock, 0),
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="productos" className="mt-6">
        <TabsList>
          <TabsTrigger value="productos">Productos ({productos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="productos">
          <Card>
            <CardContent className="pt-6">
              {isLoadingProductos ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Cargando productos...</span>
                </div>
              ) : productos.length === 0 ? (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-gray-500">Este proveedor no tiene productos asociados</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Precio Compra</TableHead>
                        <TableHead>Precio Venta</TableHead>
                        <TableHead>Margen</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productos.map((producto) => {
                        const margen = ((producto.precio - producto.precio_compra) / producto.precio_compra) * 100
                        return (
                          <TableRow key={producto.id}>
                            <TableCell className="font-mono">{producto.codigo || "-"}</TableCell>
                            <TableCell>
                              <Link
                                href={`/dashboard/inventario/${producto.id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {producto.nombre}
                              </Link>
                            </TableCell>
                            <TableCell>{producto.categoria}</TableCell>
                            <TableCell>
                              <span
                                className={producto.stock <= producto.stock_minimo ? "text-red-600 font-medium" : ""}
                              >
                                {producto.stock}
                              </span>
                            </TableCell>
                            <TableCell>{formatPrecio(producto.precio_compra)}</TableCell>
                            <TableCell>{formatPrecio(producto.precio)}</TableCell>
                            <TableCell
                              className={
                                margen < 20 ? "text-red-600" : margen < 40 ? "text-amber-600" : "text-green-600"
                              }
                            >
                              {margen.toFixed(0)}%
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={producto.estado === "activo" ? "default" : "secondary"}
                                className={
                                  producto.estado === "activo"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {producto.estado === "activo" ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el proveedor "{proveedor.nombre}"? Esta acción no se puede deshacer.
              {productos.length > 0 && (
                <div className="mt-2 rounded-md bg-amber-50 p-3 text-amber-800">
                  <strong>Advertencia:</strong> Este proveedor tiene {productos.length} productos asociados. Si lo
                  eliminas, será desactivado en lugar de eliminado completamente.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
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
    </div>
  )
}
