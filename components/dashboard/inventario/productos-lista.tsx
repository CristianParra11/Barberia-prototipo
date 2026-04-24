"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, Search, Filter, Plus, Package, RefreshCw } from "lucide-react"
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

// Tipos
interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  precio: number
  precio_compra: number
  stock: number
  stock_minimo: number
  categoria: string
  genero: string
  marca: string
  proveedor_id: string
  proveedor_nombre: string
  imagen: string
  destacado: boolean
  estado: string
  fecha_creacion: string
}

// Constantes
const categoriasProducto = [
  "Cuidado Capilar",
  "Cuidado Facial",
  "Cuidado de Barba",
  "Afeitado",
  "Styling",
  "Accesorios",
  "Perfumería",
]

const generosProducto = ["Hombre", "Mujer", "Unisex"]

export default function ProductosLista() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get("filter")

  const [searchTerm, setSearchTerm] = useState("")
  const [productos, setProductos] = useState<Producto[]>([])
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroGenero, setFiltroGenero] = useState<string>("todos")
  const [filtroStock, setFiltroStock] = useState<string>(initialFilter === "bajostock" ? "bajo" : "todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar productos
  useEffect(() => {
    loadProductos()
  }, [])

  // Función para cargar productos
  const loadProductos = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filtroCategoria !== "todas") params.append("categoria", filtroCategoria)
      if (filtroGenero !== "todos") params.append("genero", filtroGenero)
      if (filtroEstado !== "todos") params.append("estado", filtroEstado)
      if (filtroStock === "bajo") params.append("bajoStock", "true")

      const response = await fetch(`/api/productos?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProductos(data.data || [])
      } else {
        setError(data.error || "Error al cargar productos")
      }
    } catch (error) {
      setError("Error de conexión")
      console.error("Error loading productos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProductos()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filtroCategoria, filtroGenero, filtroStock, filtroEstado])

  const handleDeleteClick = (producto: Producto) => {
    setProductoToDelete(producto)
  }

  // Función para confirmar eliminación
  const confirmDelete = async () => {
    if (!productoToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/productos/${productoToDelete.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        await loadProductos() // Recargar la lista
        toast({
          title: data.action === "deleted" ? "Producto eliminado" : "Producto desactivado",
          description: data.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Error al eliminar el producto",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error de conexión al eliminar el producto",
      })
    } finally {
      setIsDeleting(false)
      setProductoToDelete(null)
    }
  }

  // Color según estado del stock
  const getColorStock = (stock: number, stockMinimo: number): string => {
    if (stock <= stockMinimo / 2) {
      return "bg-red-100 text-red-800"
    } else if (stock <= stockMinimo) {
      return "bg-amber-100 text-amber-800"
    } else {
      return "bg-green-100 text-green-800"
    }
  }

  // Renderizado condicional para loading y error
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="border rounded-md">
          <div className="p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-4">
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProductos} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
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
            placeholder="Buscar productos..."
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
                  <h4 className="font-medium">Categoría</h4>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las categorías</SelectItem>
                      {categoriasProducto.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Género</h4>
                  <Select value={filtroGenero} onValueChange={setFiltroGenero}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los géneros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los géneros</SelectItem>
                      {generosProducto.map((genero) => (
                        <SelectItem key={genero} value={genero}>
                          {genero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Stock</h4>
                  <Select value={filtroStock} onValueChange={setFiltroStock}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los niveles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los niveles</SelectItem>
                      <SelectItem value="bajo">Bajo stock</SelectItem>
                      <SelectItem value="normal">Stock normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Estado</h4>
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={loadProductos} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            <Link href="/dashboard/inventario/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No se encontraron productos</p>
                    <Button asChild variant="outline" className="mt-2">
                      <Link href="/dashboard/inventario/nuevo">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear primer producto
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        {producto.imagen ? (
                          <Image
                            src={producto.imagen || "/placeholder.svg"}
                            alt={producto.nombre}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              target.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <div
                          className={`flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d] ${
                            producto.imagen ? "hidden" : ""
                          }`}
                        >
                          <Package className="h-5 w-5" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-xs text-gray-500">{producto.marca}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{producto.codigo || "Sin código"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d]">
                      {producto.categoria}
                    </Badge>
                    <Badge variant="outline" className="ml-1 bg-gray-100">
                      {producto.genero}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrecio(producto.precio)}</TableCell>
                  <TableCell>
                    <Badge className={getColorStock(producto.stock, producto.stock_minimo)}>
                      {producto.stock} unidades
                    </Badge>
                  </TableCell>
                  <TableCell>{producto.proveedor_nombre || "Sin proveedor"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={producto.estado === "activo" ? "default" : "secondary"}
                      className={
                        producto.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {producto.estado === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver detalles">
                        <Link href={`/dashboard/inventario/${producto.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                        <Link href={`/dashboard/inventario/${producto.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(producto)}
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

      <Dialog open={!!productoToDelete} onOpenChange={(open) => !open && setProductoToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el producto "{productoToDelete?.nombre}"?
              {productoToDelete && (
                <div className="mt-2 text-sm text-amber-600">
                  <strong>Nota:</strong> Si el producto tiene ventas o citas asociadas, se desactivará en lugar de
                  eliminarse.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductoToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
