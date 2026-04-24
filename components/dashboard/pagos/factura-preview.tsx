"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrecio } from "@/lib/data"
import { ArrowLeft, Printer, Download } from "lucide-react"
import gsap from "gsap"
import Link from "next/link"

interface FacturaPreviewProps {
  id: string
  print?: boolean
}

export default function FacturaPreview({ id, print = false }: FacturaPreviewProps) {
  const router = useRouter()
  const containerRef = useRef(null)
  const facturaRef = useRef(null)
  const [empresaData, setEmpresaData] = useState(null)
  const [facturaConfig, setFacturaConfig] = useState({
    ivaDefecto: 19,
    prefijo: "CB-",
    textoLegal:
      "Esta factura sirve como comprobante de pago. Los servicios y productos tienen una garantía de 14 días desde la fecha de emisión.",
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar configuración de la empresa desde la base de datos
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const response = await fetch("/api/configuracion")
        if (response.ok) {
          const config = await response.json()

          setEmpresaData({
            nombreEmpresa: config.nombre_empresa || "Click Barber",
            razonSocial: config.razon_social || config.nombre_empresa || "Click Barber S.L.",
            cif: config.cif || "B12345678",
            direccion: config.direccion || "Calle Barbería 123",
            codigoPostal: config.codigo_postal || "28001",
            ciudad: config.ciudad || "Madrid",
            provincia: config.provincia || "Madrid",
            pais: config.pais || "España",
            telefono: config.telefono || "+34 912 345 678",
            email: config.email || "info@clickbarber.com",
            web: config.sitio_web || "www.clickbarber.com",
            piePagina: config.pie_pagina || "Gracias por confiar en Click Barber",
            logo: config.logo || "/logo-placeholder.png",
          })

          setFacturaConfig({
            ivaDefecto: config.iva_porcentaje || 19,
            prefijo: "CB-",
            textoLegal:
              "Esta factura sirve como comprobante de pago. Los servicios y productos tienen una garantía de 14 días desde la fecha de emisión.",
          })
        } else {
          // Usar valores por defecto si no se puede cargar la configuración
          setEmpresaData({
            nombreEmpresa: "Click Barber",
            razonSocial: "Click Barber S.L.",
            cif: "B12345678",
            direccion: "Calle Barbería 123",
            codigoPostal: "28001",
            ciudad: "Madrid",
            provincia: "Madrid",
            pais: "España",
            telefono: "+34 912 345 678",
            email: "info@clickbarber.com",
            web: "www.clickbarber.com",
            piePagina: "Gracias por confiar en Click Barber",
            logo: "/logo-placeholder.png",
          })
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        // Usar valores por defecto en caso de error
        setEmpresaData({
          nombreEmpresa: "Click Barber",
          razonSocial: "Click Barber S.L.",
          cif: "B12345678",
          direccion: "Calle Barbería 123",
          codigoPostal: "28001",
          ciudad: "Madrid",
          provincia: "Madrid",
          pais: "España",
          telefono: "+34 912 345 678",
          email: "info@clickbarber.com",
          web: "www.clickbarber.com",
          piePagina: "Gracias por confiar en Click Barber",
          logo: "/logo-placeholder.png",
        })
      } finally {
        setIsLoading(false)
      }
    }

    cargarConfiguracion()
  }, [])

  // Limpiar el ID para buscar la transacción
  const cleanId = id.replace(/^[VSC]-/, "")

  // Buscar la transacción usando la API
  const [transaccion, setTransaccion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransaccion = async () => {
      try {
        const response = await fetch(`/api/pagos/${id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTransaccion(data.data)
          }
        }
      } catch (error) {
        console.error("Error fetching transaction:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaccion()
  }, [id])

  // Cliente y empleado
  const cliente = transaccion?.cliente_nombre
    ? {
        nombre: transaccion.cliente_nombre,
        apellido: transaccion.cliente_apellido,
        email: transaccion.cliente_email,
        telefono: transaccion.cliente_telefono,
      }
    : null

  const empleado = transaccion?.empleado_nombre
    ? {
        nombre: transaccion.empleado_nombre,
        apellido: transaccion.empleado_apellido,
        puesto: transaccion.empleado_puesto,
      }
    : null

  // Imprimir automáticamente si se solicita
  useEffect(() => {
    if (print && transaccion && !isLoading) {
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [print, transaccion, isLoading])

  useEffect(() => {
    // Animación de entrada
    if (!print && !isLoading) {
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
    }
  }, [print, isLoading])

  // Formatear fecha
  const formatFecha = (fechaStr: string): string => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Formatear hora
  const formatHora = (fechaStr: string): string => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Generar número de factura
  const numeroFactura = `${facturaConfig.prefijo}${new Date().getFullYear()}-${cleanId}`

  // Calcular IVA
  const calcularIVA = (precio: number): number => {
    return precio * (facturaConfig.ivaDefecto / 100)
  }

  // Calcular base imponible
  const calcularBaseImponible = (precio: number): number => {
    return precio / (1 + facturaConfig.ivaDefecto / 100)
  }

  // Manejar descarga de PDF
  const handleDescargarPDF = () => {
    window.print()
  }

  if (isLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3b5d] mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!transaccion || !empresaData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Factura no encontrada</h2>
          <p className="mt-2 text-gray-500">La factura que buscas no existe o ha sido eliminada.</p>
          <p className="mt-1 text-sm text-gray-400">ID buscado: {id}</p>
        </div>
      </div>
    )
  }

  const total = Number(transaccion.total) || 0;
  const ivaPorcentaje = facturaConfig.ivaDefecto || 19;
  const baseImponible = total / (1 + ivaPorcentaje / 100);
  const iva = total - baseImponible;

  return (
    <div ref={containerRef} className={print ? "print:p-0" : ""}>
      {!print && (
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/pagos/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a detalles
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button className="bg-[#1a3b5d] hover:bg-[#2a4b6d]" onClick={handleDescargarPDF}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </div>
      )}

      <Card
        ref={facturaRef}
        className={`mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white p-8 shadow-sm ${
          print ? "shadow-none border-0" : ""
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Cabecera */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden">
                <Image
                  src={empresaData.logo || "/placeholder.svg"}
                  alt={empresaData.nombreEmpresa}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/logo-placeholder.png"
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a3b5d]">{empresaData.nombreEmpresa}</h1>
                <p className="text-sm text-gray-500">Tu barbería de confianza</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-[#1a3b5d]">
                {transaccion.tipo === "venta" ? "Factura de Venta" : "Factura de Servicio"}
              </h2>
              <p className="text-sm text-gray-500">#{numeroFactura}</p>
            </div>
          </div>

          {/* Información de la empresa y cliente */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium text-[#1a3b5d]">Datos de la Empresa</h3>
              <div className="space-y-1 text-sm">
                <p>{empresaData.razonSocial}</p>
                <p>{empresaData.direccion}</p>
                <p>
                  {empresaData.codigoPostal} {empresaData.ciudad}, {empresaData.provincia}
                </p>
                <p>{empresaData.pais}</p>
                <p>CIF: {empresaData.cif}</p>
                <p>Tel: {empresaData.telefono}</p>
                <p>Email: {empresaData.email}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-[#1a3b5d]">Cliente</h3>
              <div className="space-y-1 text-sm">
                {cliente ? (
                  <>
                    <p>
                      {cliente.nombre} {cliente.apellido}
                    </p>
                    <p>{cliente.email}</p>
                    <p>{cliente.telefono}</p>
                  </>
                ) : (
                  <p>Cliente no registrado</p>
                )}
              </div>

              <div className="mt-4">
                <h3 className="mb-2 font-medium text-[#1a3b5d]">Detalles de la Factura</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Fecha:</span> {formatFecha(transaccion.fecha)}
                  </p>
                  <p>
                    <span className="font-medium">Hora:</span> {formatHora(transaccion.fecha)}
                  </p>
                  <p>
                    <span className="font-medium">Atendido por:</span>{" "}
                    {empleado ? `${empleado.nombre} ${empleado.apellido}` : "No especificado"}
                  </p>
                  <p>
                    <span className="font-medium">Método de pago:</span>{" "}
                    {transaccion.metodo_pago
                      ? transaccion.metodo_pago.charAt(0).toUpperCase() + transaccion.metodo_pago.slice(1)
                      : "Efectivo"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle de productos o servicios */}
          <div>
            <h3 className="mb-3 font-medium text-[#1a3b5d]">
              {transaccion.tipo === "venta" ? "Detalle de Productos" : "Detalle de Servicios"}
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-4 py-2 text-left font-medium text-gray-500">
                      {transaccion.tipo === "venta" ? "Producto" : "Servicio"}
                    </th>
                    {transaccion.tipo === "venta" && (
                      <th className="border-b border-gray-200 px-4 py-2 text-center font-medium text-gray-500">
                        Cantidad
                      </th>
                    )}
                    <th className="border-b border-gray-200 px-4 py-2 text-right font-medium text-gray-500">
                      Precio Unitario
                    </th>
                    <th className="border-b border-gray-200 px-4 py-2 text-right font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transaccion.tipo === "venta"
                    ? // Productos
                      transaccion.productos?.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-200 last:border-0">
                          <td className="px-4 py-3">{item.producto_nombre}</td>
                          <td className="px-4 py-3 text-center">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right">{formatPrecio(item.precio_unitario)}</td>
                          <td className="px-4 py-3 text-right">{formatPrecio(item.subtotal)}</td>
                        </tr>
                      ))
                    : // Servicios
                      transaccion.servicios?.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-200 last:border-0">
                          <td className="px-4 py-3">{item.servicio_nombre}</td>
                          <td className="px-4 py-3 text-right">{formatPrecio(item.precio)}</td>
                          <td className="px-4 py-3 text-right">{formatPrecio(item.precio)}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de totales */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Base Imponible:</span>
                <span className="font-medium">{formatPrecio(baseImponible)}</span>
              </div>

              {transaccion.descuento && transaccion.descuento > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">Descuento ({transaccion.descuento}%):</span>
                  <span className="font-medium">-{formatPrecio(baseImponible * (transaccion.descuento / 100))}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm">IVA ({facturaConfig.ivaDefecto}%):</span>
                <span className="font-medium">{formatPrecio(iva)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold text-[#1a3b5d]">{formatPrecio(total)}</span>
              </div>
            </div>
          </div>

          {/* Notas y condiciones */}
          <div className="space-y-4 text-sm text-gray-500">
            {transaccion.notas && (
              <div>
                <h3 className="mb-1 font-medium text-[#1a3b5d]">Notas</h3>
                <p>{transaccion.notas}</p>
              </div>
            )}

            <div>
              <h3 className="mb-1 font-medium text-[#1a3b5d]">Condiciones</h3>
              <p>{facturaConfig.textoLegal}</p>
            </div>

            <div className="text-center">
              <p>{empresaData.piePagina}</p>
              <p>
                {empresaData.web} - Tel: {empresaData.telefono}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
