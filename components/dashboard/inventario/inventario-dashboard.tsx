"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Package, AlertTriangle, DollarSign, ShoppingCart, Truck, BarChart3, Eye } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { formatPrecio } from "@/lib/utils"

interface EstadisticasInventario {
  totalProductos: number
  productosActivos: number
  productosInactivos: number
  productosBajoStock: number
  valorTotalInventario: number
  totalProveedores: number
  proveedoresActivos: number
  categorias: { categoria: string; cantidad: number }[]
  productosMasVendidos: any[]
}

export default function InventarioDashboard() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasInventario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEstadisticas()
  }, [])

  const loadEstadisticas = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Cargar productos y proveedores
      const [productosResponse, proveedoresResponse] = await Promise.all([
        apiClient.getProductos(),
        apiClient.getProveedores(),
      ])

      if (productosResponse.success && proveedoresResponse.success) {
        const productos = productosResponse.data || []
        const proveedores = proveedoresResponse.data || []

        // Calcular estadísticas
        const productosActivos = productos.filter((p) => p.estado === "activo")
        const productosInactivos = productos.filter((p) => p.estado === "inactivo")
        const productosBajoStock = productos.filter((p) => p.stock <= p.stock_minimo)
        const valorTotalInventario = productos.reduce((total, p) => total + p.precio_compra * p.stock, 0)
        const proveedoresActivos = proveedores.filter((p) => p.estado === "activo")

        // Agrupar por categorías
        const categorias = productos.reduce(
          (acc, producto) => {
            const categoria = producto.categoria
            const existing = acc.find((c) => c.categoria === categoria)
            if (existing) {
              existing.cantidad++
            } else {
              acc.push({ categoria, cantidad: 1 })
            }
            return acc
          },
          [] as { categoria: string; cantidad: number }[],
        )

        setEstadisticas({
          totalProductos: productos.length,
          productosActivos: productosActivos.length,
          productosInactivos: productosInactivos.length,
          productosBajoStock: productosBajoStock.length,
          valorTotalInventario,
          totalProveedores: proveedores.length,
          proveedoresActivos: proveedoresActivos.length,
          categorias: categorias.sort((a, b) => b.cantidad - a.cantidad),
          productosMasVendidos: [], // Por implementar cuando tengamos datos de ventas
        })
      } else {
        setError("Error al cargar las estadísticas")
      }
    } catch (error) {
      console.error("Error loading estadisticas:", error)
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadEstadisticas} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (!estadisticas) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  const porcentajeStock =
    estadisticas.totalProductos > 0
      ? ((estadisticas.totalProductos - estadisticas.productosBajoStock) / estadisticas.totalProductos) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalProductos}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.productosActivos} activos, {estadisticas.productosInactivos} inactivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrecio(estadisticas.valorTotalInventario)}</div>
            <p className="text-xs text-muted-foreground">Valor total en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.productosBajoStock}</div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.productosBajoStock > 0 ? "Requieren reabastecimiento" : "Stock saludable"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalProveedores}</div>
            <p className="text-xs text-muted-foreground">{estadisticas.proveedoresActivos} activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y acciones rápidas */}
      {estadisticas.productosBajoStock > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Productos con bajo stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              Tienes {estadisticas.productosBajoStock} productos que requieren reabastecimiento.
            </p>
            <Button asChild variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <Link href="/dashboard/inventario?filter=bajostock">
                <Eye className="mr-2 h-4 w-4" />
                Ver productos con bajo stock
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Gráficos y estadísticas detalladas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estado del Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Stock saludable</span>
                <span>{porcentajeStock.toFixed(1)}%</span>
              </div>
              <Progress value={porcentajeStock} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Stock normal</p>
                <p className="font-medium">{estadisticas.totalProductos - estadisticas.productosBajoStock}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bajo stock</p>
                <p className="font-medium text-red-600">{estadisticas.productosBajoStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Productos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadisticas.categorias.slice(0, 5).map((categoria, index) => (
                <div key={categoria.categoria} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d]">
                      {categoria.categoria}
                    </Badge>
                  </div>
                  <span className="font-medium">{categoria.cantidad}</span>
                </div>
              ))}
              {estadisticas.categorias.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No hay categorías disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
              <Link href="/dashboard/inventario/nuevo">
                <Package className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/proveedores/nuevo">
                <Truck className="mr-2 h-4 w-4" />
                Nuevo Proveedor
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/inventario?filter=bajostock">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Revisar Stock
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
