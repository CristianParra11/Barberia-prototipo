"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { formatPrecio } from "@/lib/utils"
import {
  BarChart,
  Calendar,
  Download,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Scissors,
} from "lucide-react"
import gsap from "gsap"

interface ReporteFinanciero {
  periodo: {
    inicio: string
    fin: string
    nombre: string
  }
  ingresos: {
    servicios: { total: number; cantidad: number }
    ventas: { total: number; cantidad: number }
    total: number
  }
  topServicios: any[]
  topProductos: any[]
  topClientes: any[]
  topEmpleados: any[]
  evolucionMensual: any[]
  metodosPago: any[]
}

// Componente de gráfico de líneas simple
const GraficoTendencias = ({ datos }: { datos: any[] }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!datos || datos.length === 0 || !svgRef.current) return

    // Procesar datos para el gráfico
    const datosProcesados = datos.reduce((acc: any, item: any) => {
      const mes = item.mes
      if (!acc[mes]) {
        acc[mes] = { mes, servicios: 0, ventas: 0 }
      }
      if (item.tipo === "servicio") {
        acc[mes].servicios = Number.parseFloat(item.total)
      } else if (item.tipo === "venta") {
        acc[mes].ventas = Number.parseFloat(item.total)
      }
      return acc
    }, {})

    const datosArray = Object.values(datosProcesados).sort((a: any, b: any) => a.mes.localeCompare(b.mes))

    if (datosArray.length === 0) return

    const svg = svgRef.current
    const width = 600
    const height = 300
    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Limpiar SVG
    svg.innerHTML = ""

    // Encontrar valores máximos
    const maxServicios = Math.max(...datosArray.map((d: any) => d.servicios))
    const maxVentas = Math.max(...datosArray.map((d: any) => d.ventas))
    const maxValue = Math.max(maxServicios, maxVentas)

    // Escalas
    const xScale = (index: number) => (index / (datosArray.length - 1)) * chartWidth
    const yScale = (value: number) => chartHeight - (value / maxValue) * chartHeight

    // Crear grupo principal
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    g.setAttribute("transform", `translate(${margin.left},${margin.top})`)

    // Líneas de grid
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * chartHeight
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute("x1", "0")
      line.setAttribute("y1", y.toString())
      line.setAttribute("x2", chartWidth.toString())
      line.setAttribute("y2", y.toString())
      line.setAttribute("stroke", "#e5e7eb")
      line.setAttribute("stroke-width", "1")
      g.appendChild(line)

      // Etiquetas del eje Y
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", "-10")
      text.setAttribute("y", (y + 4).toString())
      text.setAttribute("text-anchor", "end")
      text.setAttribute("font-size", "12")
      text.setAttribute("fill", "#6b7280")
      text.textContent = formatPrecio(maxValue * (1 - i / 5))
      g.appendChild(text)
    }

    // Función para crear línea
    const createLine = (data: any[], getValue: (d: any) => number, color: string) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      const pathData = data
        .map((d, i) => {
          const x = xScale(i)
          const y = yScale(getValue(d))
          return `${i === 0 ? "M" : "L"} ${x} ${y}`
        })
        .join(" ")

      path.setAttribute("d", pathData)
      path.setAttribute("fill", "none")
      path.setAttribute("stroke", color)
      path.setAttribute("stroke-width", "3")
      path.setAttribute("stroke-linecap", "round")
      path.setAttribute("stroke-linejoin", "round")

      return path
    }

    // Línea de servicios
    const lineaServicios = createLine(datosArray, (d: any) => d.servicios, "#1a3b5d")
    g.appendChild(lineaServicios)

    // Línea de ventas
    const lineaVentas = createLine(datosArray, (d: any) => d.ventas, "#059669")
    g.appendChild(lineaVentas)

    // Puntos de servicios
    datosArray.forEach((d: any, i: number) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("cx", xScale(i).toString())
      circle.setAttribute("cy", yScale(d.servicios).toString())
      circle.setAttribute("r", "4")
      circle.setAttribute("fill", "#1a3b5d")
      g.appendChild(circle)
    })

    // Puntos de ventas
    datosArray.forEach((d: any, i: number) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      circle.setAttribute("cx", xScale(i).toString())
      circle.setAttribute("cy", yScale(d.ventas).toString())
      circle.setAttribute("r", "4")
      circle.setAttribute("fill", "#059669")
      g.appendChild(circle)
    })

    // Etiquetas del eje X
    datosArray.forEach((d: any, i: number) => {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", xScale(i).toString())
      text.setAttribute("y", (chartHeight + 20).toString())
      text.setAttribute("text-anchor", "middle")
      text.setAttribute("font-size", "12")
      text.setAttribute("fill", "#6b7280")
      text.textContent = d.mes
      g.appendChild(text)
    })

    svg.appendChild(g)

    // Leyenda
    const legend = document.createElementNS("http://www.w3.org/2000/svg", "g")
    legend.setAttribute("transform", `translate(${width - 150}, 20)`)

    // Servicios
    const serviciosRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    serviciosRect.setAttribute("x", "0")
    serviciosRect.setAttribute("y", "0")
    serviciosRect.setAttribute("width", "12")
    serviciosRect.setAttribute("height", "12")
    serviciosRect.setAttribute("fill", "#1a3b5d")
    legend.appendChild(serviciosRect)

    const serviciosText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    serviciosText.setAttribute("x", "18")
    serviciosText.setAttribute("y", "10")
    serviciosText.setAttribute("font-size", "12")
    serviciosText.setAttribute("fill", "#374151")
    serviciosText.textContent = "Servicios"
    legend.appendChild(serviciosText)

    // Ventas
    const ventasRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    ventasRect.setAttribute("x", "0")
    ventasRect.setAttribute("y", "20")
    ventasRect.setAttribute("width", "12")
    ventasRect.setAttribute("height", "12")
    ventasRect.setAttribute("fill", "#059669")
    legend.appendChild(ventasRect)

    const ventasText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    ventasText.setAttribute("x", "18")
    ventasText.setAttribute("y", "30")
    ventasText.setAttribute("font-size", "12")
    ventasText.setAttribute("fill", "#374151")
    ventasText.textContent = "Ventas"
    legend.appendChild(ventasText)

    svg.appendChild(legend)
  }, [datos])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg ref={svgRef} width="600" height="300" viewBox="0 0 600 300" className="max-w-full h-auto" />
    </div>
  )
}

export default function InformesFinancieros() {
  const containerRef = useRef(null)
  const [periodoActual, setPeriodoActual] = useState("mes")
  const [comparacionActiva, setComparacionActiva] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reporte, setReporte] = useState<ReporteFinanciero | null>(null)
  const [reporteAnterior, setReporteAnterior] = useState<ReporteFinanciero | null>(null)

  // Cargar datos del reporte
  const cargarReporte = async (periodo: string) => {
    try {
      setLoading(true)
      console.log("Cargando reporte para período:", periodo)

      const response = await fetch(`/api/reportes/financieros?periodo=${periodo}`)
      const data = await response.json()

      if (data.success) {
        setReporte(data.data)
        console.log("Reporte cargado:", data.data)
      } else {
        throw new Error(data.error || "Error al cargar el reporte")
      }
    } catch (error) {
      console.error("Error loading report:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte financiero",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar reporte del período anterior para comparación
  const cargarReporteAnterior = async (periodo: string) => {
    try {
      const periodoAnterior = periodo === "mes" ? "mes-anterior" : "anio-anterior"
      const response = await fetch(`/api/reportes/financieros?periodo=${periodoAnterior}`)
      const data = await response.json()

      if (data.success) {
        setReporteAnterior(data.data)
      }
    } catch (error) {
      console.error("Error loading previous report:", error)
    }
  }

  // Calcular porcentaje de cambio
  const calcularPorcentajeCambio = (actual: number, anterior: number) => {
    if (anterior === 0) return actual > 0 ? 100 : 0
    return ((actual - anterior) / anterior) * 100
  }

  // Formatear porcentaje
  const formatPorcentaje = (porcentaje: number): string => {
    return `${porcentaje > 0 ? "+" : ""}${porcentaje.toFixed(1)}%`
  }

  // Manejar cambio de período
  const handlePeriodoChange = (nuevoPeriodo: string) => {
    setPeriodoActual(nuevoPeriodo)
    cargarReporte(nuevoPeriodo)
    if (comparacionActiva) {
      cargarReporteAnterior(nuevoPeriodo)
    }
  }

  // Manejar activación de comparación
  const handleComparacionToggle = () => {
    const nuevaComparacion = !comparacionActiva
    setComparacionActiva(nuevaComparacion)
    if (nuevaComparacion && !reporteAnterior) {
      cargarReporteAnterior(periodoActual)
    }
  }

  // Exportar a PDF
  const handleExportarPDF = () => {
    if (!reporte) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte Financiero - Click Barber</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Click Barber</h1>
            <h2>Reporte Financiero</h2>
            <p>Período: ${reporte.periodo.inicio} - ${reporte.periodo.fin}</p>
            <p>Generado: ${new Date().toLocaleDateString("es-CO")}</p>
          </div>

          <div class="section">
            <h3>Resumen de Ingresos</h3>
            <table>
              <tr><th>Categoría</th><th>Cantidad</th><th>Total</th></tr>
              <tr><td>Servicios</td><td>${reporte.ingresos.servicios.cantidad}</td><td>${formatPrecio(reporte.ingresos.servicios.total)}</td></tr>
              <tr><td>Ventas</td><td>${reporte.ingresos.ventas.cantidad}</td><td>${formatPrecio(reporte.ingresos.ventas.total)}</td></tr>
              <tr class="total"><td>Total</td><td>${reporte.ingresos.servicios.cantidad + reporte.ingresos.ventas.cantidad}</td><td>${formatPrecio(reporte.ingresos.total)}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Top Servicios</h3>
            <table>
              <tr><th>Servicio</th><th>Cantidad</th><th>Total</th></tr>
              ${reporte.topServicios
                .map(
                  (item) => `
                <tr><td>${item.nombre}</td><td>${item.cantidad}</td><td>${formatPrecio(item.total_ingresos)}</td></tr>
              `,
                )
                .join("")}
            </table>
          </div>

          <div class="section">
            <h3>Top Productos</h3>
            <table>
              <tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr>
              ${reporte.topProductos
                .map(
                  (item) => `
                <tr><td>${item.nombre}</td><td>${item.cantidad}</td><td>${formatPrecio(item.total_ingresos)}</td></tr>
              `,
                )
                .join("")}
            </table>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // Exportar a Excel (CSV)
  const handleExportarExcel = () => {
    if (!reporte) return

    const csvData = [
      ["Click Barber - Reporte Financiero"],
      [`Período: ${reporte.periodo.inicio} - ${reporte.periodo.fin}`],
      [`Generado: ${new Date().toLocaleDateString("es-CO")}`],
      [],
      ["RESUMEN DE INGRESOS"],
      ["Categoría", "Cantidad", "Total"],
      ["Servicios", reporte.ingresos.servicios.cantidad.toString(), reporte.ingresos.servicios.total.toString()],
      ["Ventas", reporte.ingresos.ventas.cantidad.toString(), reporte.ingresos.ventas.total.toString()],
      [
        "Total",
        (reporte.ingresos.servicios.cantidad + reporte.ingresos.ventas.cantidad).toString(),
        reporte.ingresos.total.toString(),
      ],
      [],
      ["TOP SERVICIOS"],
      ["Servicio", "Cantidad", "Total"],
      ...reporte.topServicios.map((item) => [item.nombre, item.cantidad.toString(), item.total_ingresos.toString()]),
      [],
      ["TOP PRODUCTOS"],
      ["Producto", "Cantidad", "Total"],
      ...reporte.topProductos.map((item) => [item.nombre, item.cantidad.toString(), item.total_ingresos.toString()]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-financiero-${reporte.periodo.inicio}-${reporte.periodo.fin}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Éxito",
      description: "Reporte exportado correctamente",
    })
  }

  useEffect(() => {
    cargarReporte(periodoActual)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!reporte) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">No se pudo cargar el reporte</p>
          <Button onClick={() => cargarReporte(periodoActual)} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Calcular cambios si hay comparación
  const cambioServicios = reporteAnterior
    ? calcularPorcentajeCambio(reporte.ingresos.servicios.total, reporteAnterior.ingresos.servicios.total)
    : 0
  const cambioVentas = reporteAnterior
    ? calcularPorcentajeCambio(reporte.ingresos.ventas.total, reporteAnterior.ingresos.ventas.total)
    : 0
  const cambioTotal = reporteAnterior
    ? calcularPorcentajeCambio(reporte.ingresos.total, reporteAnterior.ingresos.total)
    : 0

  return (
    <div ref={containerRef}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Select value={periodoActual} onValueChange={handlePeriodoChange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Este mes</SelectItem>
              <SelectItem value="anio">Este año</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={comparacionActiva ? "default" : "outline"}
            className={comparacionActiva ? "bg-[#1a3b5d] hover:bg-[#2a4b6d]" : ""}
            onClick={handleComparacionToggle}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Comparar con período anterior
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportarPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportarExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos por Servicios</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrecio(reporte.ingresos.servicios.total)}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{reporte.ingresos.servicios.cantidad} servicios</p>
              {comparacionActiva && reporteAnterior && (
                <Badge variant={cambioServicios >= 0 ? "default" : "destructive"} className="text-xs">
                  {cambioServicios >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPorcentaje(cambioServicios)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos por Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrecio(reporte.ingresos.ventas.total)}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{reporte.ingresos.ventas.cantidad} ventas</p>
              {comparacionActiva && reporteAnterior && (
                <Badge variant={cambioVentas >= 0 ? "default" : "destructive"} className="text-xs">
                  {cambioVentas >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPorcentaje(cambioVentas)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrecio(reporte.ingresos.total)}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {reporte.ingresos.servicios.cantidad + reporte.ingresos.ventas.cantidad} transacciones
              </p>
              {comparacionActiva && reporteAnterior && (
                <Badge variant={cambioTotal >= 0 ? "default" : "destructive"} className="text-xs">
                  {cambioTotal >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPorcentaje(cambioTotal)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Transacción</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrecio(
                reporte.ingresos.total / (reporte.ingresos.servicios.cantidad + reporte.ingresos.ventas.cantidad) || 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ticket promedio</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Tendencias
          </TabsTrigger>
          <TabsTrigger value="desglose" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Desglose
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Servicios */}
            <Card>
              <CardHeader>
                <CardTitle>Top Servicios</CardTitle>
                <CardDescription>Los servicios más solicitados en el período</CardDescription>
              </CardHeader>
              <CardContent>
                {reporte.topServicios.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Servicio</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporte.topServicios.slice(0, 5).map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#1a3b5d] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{item.nombre}</div>
                                <div className="text-xs text-muted-foreground">{item.categoria}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.cantidad}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrecio(item.total_ingresos)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No hay servicios en este período</div>
                )}
              </CardContent>
            </Card>

            {/* Top Productos */}
            <Card>
              <CardHeader>
                <CardTitle>Top Productos</CardTitle>
                <CardDescription>Los productos más vendidos en el período</CardDescription>
              </CardHeader>
              <CardContent>
                {reporte.topProductos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporte.topProductos.slice(0, 5).map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#1a3b5d] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{item.nombre}</div>
                                <div className="text-xs text-muted-foreground">{item.categoria}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.cantidad}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrecio(item.total_ingresos)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay productos vendidos en este período
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Clientes */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clientes</CardTitle>
                <CardDescription>Los clientes con mayor gasto en el período</CardDescription>
              </CardHeader>
              <CardContent>
                {reporte.topClientes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Servicios</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporte.topClientes.slice(0, 5).map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={item.foto || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {item.nombre?.charAt(0)}
                                  {item.apellido?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {item.nombre} {item.apellido}
                                </div>
                                <div className="text-xs text-muted-foreground">{item.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.servicios}</TableCell>
                          <TableCell className="text-right">{item.ventas}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrecio(item.total_gastado)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No hay clientes en este período</div>
                )}
              </CardContent>
            </Card>

            {/* Top Empleados */}
            <Card>
              <CardHeader>
                <CardTitle>Top Empleados</CardTitle>
                <CardDescription>Los empleados con mayor facturación en el período</CardDescription>
              </CardHeader>
              <CardContent>
                {reporte.topEmpleados.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead className="text-right">Servicios</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporte.topEmpleados.slice(0, 5).map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={item.foto || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {item.nombre?.charAt(0)}
                                  {item.apellido?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {item.nombre} {item.apellido}
                                </div>
                                <div className="text-xs text-muted-foreground">{item.puesto}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.servicios}</TableCell>
                          <TableCell className="text-right">{item.ventas}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrecio(item.total_generado)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay empleados con actividad en este período
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Ingresos</CardTitle>
              <CardDescription>Tendencia de ingresos por servicios y ventas</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {reporte.evolucionMensual && reporte.evolucionMensual.length > 0 ? (
                <GraficoTendencias datos={reporte.evolucionMensual} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <LineChart className="mx-auto h-16 w-16 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No hay datos suficientes para mostrar tendencias</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desglose" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>Distribución por método de pago</CardDescription>
              </CardHeader>
              <CardContent>
                {reporte.metodosPago.length > 0 ? (
                  <div className="space-y-4">
                    {reporte.metodosPago.map((metodo) => (
                      <div key={metodo.metodo_pago} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {metodo.metodo_pago}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{metodo.cantidad} transacciones</span>
                        </div>
                        <div className="font-medium">{formatPrecio(metodo.total)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No hay datos de métodos de pago</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Ingresos</CardTitle>
                <CardDescription>Servicios vs Ventas</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <PieChart className="mx-auto h-16 w-16 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Distribución de ingresos</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Servicios:</span>
                        <span className="font-medium">{formatPrecio(reporte.ingresos.servicios.total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Ventas:</span>
                        <span className="font-medium">{formatPrecio(reporte.ingresos.ventas.total)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatPrecio(reporte.ingresos.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
