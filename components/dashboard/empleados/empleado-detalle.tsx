"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Pencil, ArrowLeft, Mail, Phone, Calendar, Briefcase, User, Star, Scissors, TrendingUp } from "lucide-react"
import type { Empleado } from "@/lib/api-client"

interface EmpleadoDetalleProps {
  empleado: Empleado
}

export default function EmpleadoDetalle({ empleado }: EmpleadoDetalleProps) {
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/empleados">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
          <Link href={`/dashboard/empleados/${empleado.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 overflow-hidden rounded-full">
                  {empleado.foto ? (
                    <Image
                      src={empleado.foto || "/placeholder.svg"}
                      alt={`${empleado.nombre} ${empleado.apellido}`}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d]">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl text-[#1a3b5d]">
                    {empleado.nombre} {empleado.apellido}
                  </CardTitle>
                  <CardDescription className="text-lg">{empleado.puesto}</CardDescription>
                  <Badge
                    variant={empleado.estado === "activo" ? "default" : "secondary"}
                    className={
                      empleado.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }
                  >
                    {empleado.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#1a3b5d]">Información de Contacto</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Contratado: {formatDate(empleado.fecha_contratacion)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{empleado.puesto}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#1a3b5d]">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {empleado.especialidades && empleado.especialidades.length > 0 ? (
                    empleado.especialidades.map((especialidad, index) => (
                      <Badge key={index} variant="outline" className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{especialidad}</span>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No hay especialidades registradas</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1a3b5d]">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <Scissors className="h-5 w-5 text-[#1a3b5d]" />
                  </div>
                  <div className="text-2xl font-bold text-[#1a3b5d]">{empleado.estadisticas?.totalCitas || 0}</div>
                  <p className="text-xs text-muted-foreground">Total Citas</p>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {empleado.estadisticas?.citasCompletadas || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {empleado.estadisticas?.citasPendientes || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{empleado.estadisticas?.totalVentas || 0}</div>
                  <p className="text-xs text-muted-foreground">Ventas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-[#1a3b5d]">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>ID:</strong> {empleado.id}
                </p>
                <p>
                  <strong>Fecha de registro:</strong>{" "}
                  {empleado.created_at ? formatDate(empleado.created_at) : "No disponible"}
                </p>
                <p>
                  <strong>Última actualización:</strong>{" "}
                  {empleado.updated_at ? formatDate(empleado.updated_at) : "No disponible"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
