"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, Building2, Phone, FileText, Percent, MapPin } from "lucide-react"

interface ConfiguracionData {
  nombre_empresa: string
  razon_social: string
  direccion: string
  ciudad: string
  codigo_postal: string
  provincia: string
  pais: string
  telefono: string
  email: string
  sitio_web: string
  cif: string
  pie_pagina: string
  logo: string
  moneda: string
  zona_horaria: string
  idioma: string
  iva_porcentaje: number
}

export default function ConfiguracionGeneral() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [configuracion, setConfiguracion] = useState<ConfiguracionData>({
    nombre_empresa: "",
    razon_social: "",
    direccion: "",
    ciudad: "",
    codigo_postal: "",
    provincia: "",
    pais: "",
    telefono: "",
    email: "",
    sitio_web: "",
    cif: "",
    pie_pagina: "",
    logo: "",
    moneda: "COP",
    zona_horaria: "America/Bogota",
    idioma: "es",
    iva_porcentaje: 19,
  })

  // Cargar configuración al montar el componente
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const response = await fetch("/api/configuracion")
        if (response.ok) {
          const data = await response.json()
          setConfiguracion(data)
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar la configuración",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "Error de conexión al cargar la configuración",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    cargarConfiguracion()
  }, [toast])

  const handleInputChange = (field: keyof ConfiguracionData, value: string | number) => {
    setConfiguracion((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogoChange = (url: string | null) => {
    setConfiguracion((prev) => ({
      ...prev,
      logo: url || "/logo-placeholder.png",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/configuracion", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configuracion),
      })

      if (response.ok) {
        toast({
          title: "✅ Configuración actualizada",
          description: "Los cambios se han guardado correctamente y ya están disponibles en las facturas",
          duration: 4000,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error al guardar",
          description: errorData.error || "No se pudieron guardar los cambios",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración General</h2>
        <p className="text-muted-foreground">
          Configura los datos básicos de tu empresa que aparecerán en las facturas y documentos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de la Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
            <CardDescription>Datos básicos que aparecerán en las facturas y documentos oficiales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_empresa">
                      Nombre de la Empresa <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre_empresa"
                      value={configuracion.nombre_empresa}
                      onChange={(e) => handleInputChange("nombre_empresa", e.target.value)}
                      placeholder="Click Barber Shop"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razon_social">Razón Social</Label>
                    <Input
                      id="razon_social"
                      value={configuracion.razon_social}
                      onChange={(e) => handleInputChange("razon_social", e.target.value)}
                      placeholder="Click Barber Shop S.L."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cif">
                    CIF/NIF <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cif"
                    value={configuracion.cif}
                    onChange={(e) => handleInputChange("cif", e.target.value)}
                    placeholder="B12345678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">
                    Dirección <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="direccion"
                    value={configuracion.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    placeholder="Calle Principal 123"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="space-y-2">
                  <Label>Logo de la Empresa</Label>
                  <ImageUpload value={configuracion.logo} onChange={handleLogoChange} size="lg" />
                  <p className="text-xs text-gray-500 text-center">Máximo 5MB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
            <CardDescription>Información de ubicación que aparecerá en las facturas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">
                  Ciudad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ciudad"
                  value={configuracion.ciudad}
                  onChange={(e) => handleInputChange("ciudad", e.target.value)}
                  placeholder="Madrid"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_postal">
                  Código Postal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="codigo_postal"
                  value={configuracion.codigo_postal}
                  onChange={(e) => handleInputChange("codigo_postal", e.target.value)}
                  placeholder="28001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provincia">
                  Provincia/Estado <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="provincia"
                  value={configuracion.provincia}
                  onChange={(e) => handleInputChange("provincia", e.target.value)}
                  placeholder="Madrid"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pais">
                País <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pais"
                value={configuracion.pais}
                onChange={(e) => handleInputChange("pais", e.target.value)}
                placeholder="España"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Información de Contacto
            </CardTitle>
            <CardDescription>Datos de contacto que aparecerán en las facturas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  value={configuracion.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="910 123 456"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={configuracion.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="info@clickbarbershop.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sitio_web">Sitio Web</Label>
              <Input
                id="sitio_web"
                value={configuracion.sitio_web}
                onChange={(e) => handleInputChange("sitio_web", e.target.value)}
                placeholder="https://www.clickbarbershop.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Facturación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Configuración de Facturación
            </CardTitle>
            <CardDescription>Configuración específica para la generación de facturas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iva_porcentaje">
                  IVA (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="iva_porcentaje"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={configuracion.iva_porcentaje}
                  onChange={(e) => handleInputChange("iva_porcentaje", Number.parseFloat(e.target.value) || 0)}
                  placeholder="19"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda</Label>
                <Input
                  id="moneda"
                  value={configuracion.moneda}
                  onChange={(e) => handleInputChange("moneda", e.target.value)}
                  placeholder="COP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zona_horaria">Zona Horaria</Label>
                <Input
                  id="zona_horaria"
                  value={configuracion.zona_horaria}
                  onChange={(e) => handleInputChange("zona_horaria", e.target.value)}
                  placeholder="America/Bogota"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Personalización
            </CardTitle>
            <CardDescription>Personaliza los textos que aparecen en las facturas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pie_pagina">Pie de Página</Label>
              <Textarea
                id="pie_pagina"
                value={configuracion.pie_pagina}
                onChange={(e) => handleInputChange("pie_pagina", e.target.value)}
                placeholder="Gracias por confiar en Click Barber Shop"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botón de Guardar */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="min-w-[120px]">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
