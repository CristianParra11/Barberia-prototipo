"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import EmpleadoForm from "@/components/dashboard/empleados/empleado-form"

export default function NuevoEmpleadoPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a3b5d]">Nuevo Empleado</h1>
          <p className="text-muted-foreground">Registra un nuevo miembro del equipo</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/empleados">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1a3b5d]">Información del Empleado</CardTitle>
          <CardDescription>Completa todos los campos para registrar al nuevo empleado</CardDescription>
        </CardHeader>
        <CardContent>
          <EmpleadoForm />
        </CardContent>
      </Card>
    </div>
  )
}
