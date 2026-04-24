"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Pencil,
  Package,
  DollarSign,
  Truck,
  ShoppingBag,
  BarChart3,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { formatPrecio } from "@/lib/utils"

interface ProductoDetalleProps {
  producto: any // Usando any temporalmente para evitar problemas de tipos
}

export default function ProductoDetalle({ producto }: ProductoDetalleProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Efecto para marcar cuando el componente está montado
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Formatear fecha - maneja diferentes formatos de la base de datos
  const formatFecha = (fecha: string): string => {
    if (!fecha) return "No disponible"

    try {
      let fechaObj: Date

      // Si la fecha ya incluye tiempo, usarla directamente
      if (fecha.includes("T") || fecha.includes(" ")) {
        fechaObj = new Date(fecha)
      } else {
        // Si es solo fecha (YYYY-MM-DD), agregar tiempo para evitar problemas de zona horaria
        fechaObj = new Date(fecha + "T00:00:00")
      }

      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        console.error("Fecha inválida recibida:", fecha)
        return "Fecha inválida"
      }

      return fechaObj.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error al formatear fecha:", error, "Fecha recibida:", fecha)
      return "Error en fecha"
    }
  }

  // Calcular margen de beneficio
  const calcularMargen = (): number => {
    const precio = Number(producto.precio) || 0
    const precioCompra = Number(producto.precio_compra) || 0

    if (precio <= 0 || precioCompra <= 0) return 0
    return ((precio - precioCompra) / precio) * 100
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

  // Esqueleto de carga mientras se monta el componente
  if (!isMounted) {
    return (
      <div className="p-6 animate-pulse">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-32 rounded-md bg-gray-200"></div>
          <div className="h-10 w-40 rounded-md bg-gray-200"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-48 rounded bg-gray-200"></div>
                <div className="h-6 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="flex justify-center my-6">
                <div className="h-48 w-48 rounded-md bg-gray-200"></div>
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-20 rounded bg-gray-200"></div>
                      <div className="h-5 w-full rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
                <div className="h-32 w-full rounded-md bg-gray-200"></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="h-6 w-48 rounded bg-gray-200 mb-6"></div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="h-24 rounded-md bg-gray-200"></div>
                <div className="h-24 rounded-md bg-gray-200"></div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 w-full rounded-md bg-gray-200 mb-6"></div>
              ))}
              <div className="h-10 w-full rounded-md bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/inventario">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a inventario
          </Link>
        </Button>
        <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
          <Link href={`/dashboard/inventario/${producto.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar producto
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-[#1a3b5d]">{producto.nombre}</CardTitle>
              <Badge
                variant={producto.estado === "activo" ? "default" : "secondary"}
                className={producto.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
              >
                {producto.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="h-48 w-48 overflow-hidden rounded-md border-4 border-[#e6f0f9]">
                {producto.imagen ? (
                  <Image
                    src={producto.imagen || "/placeholder.svg"}
                    alt={producto.nombre}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-4xl font-bold text-[#1a3b5d]">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="font-medium">{producto.codigo || "Sin código"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categoría</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d]">
                      {producto.categoria}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100">
                      {producto.genero}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Precios</p>
                  <p className="font-medium">
                    Venta: {formatPrecio(producto.precio)} | Compra: {formatPrecio(producto.precio_compra)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getColorStock(producto.stock, producto.stock_minimo)}>
                      {producto.stock} unidades
                    </Badge>
                    <span className="text-sm text-gray-500">(Mínimo: {producto.stock_minimo})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d]">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proveedor</p>
                  <p className="font-medium">{producto.proveedor_nombre || "Proveedor desconocido"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="mb-2 font-medium text-[#1a3b5d]">Descripción</h3>
              <p className="text-gray-600">{producto.descripcion || "Sin descripción"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a3b5d]">Estadísticas y Detalles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border border-gray-200 p-4 text-center">
                <div className="mb-1 flex justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-500">Margen de beneficio</p>
                <p className="text-2xl font-bold text-[#1a3b5d]">{calcularMargen().toFixed(2)}%</p>
              </div>
              <div className="rounded-md border border-gray-200 p-4 text-center">
                <div className="mb-1 flex justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-sm text-gray-500">Valor en stock</p>
                <p className="text-2xl font-bold text-[#1a3b5d]">
                  {formatPrecio((producto.precio_compra || 0) * (producto.stock || 0))}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="mb-3 font-medium text-[#1a3b5d]">Información adicional</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Marca:</span>
                  <span className="font-medium">{producto.marca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha de creación:</span>
                  <span className="font-medium">{formatFecha(producto.fecha_creacion || producto.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor en stock:</span>
                  <span className="font-medium">
                    {formatPrecio((producto.precio_compra || 0) * (producto.stock || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destacado:</span>
                  <span className="font-medium">{producto.destacado ? "Sí" : "No"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h3 className="mb-3 font-medium text-[#1a3b5d]">Proveedor</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre:</span>
                  <span className="font-medium">{producto.proveedor_nombre || "No disponible"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contacto:</span>
                  <span className="font-medium">{producto.proveedor_contacto || "No disponible"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono:</span>
                  <span className="font-medium">{producto.proveedor_telefono || "No disponible"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{producto.proveedor_email || "No disponible"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/inventario/nuevo?proveedor=${producto.proveedor_id}`}>
                  <Package className="mr-2 h-4 w-4" />
                  Añadir otro producto de este proveedor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
