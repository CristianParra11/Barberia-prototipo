"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, UserCheck, UserX } from "lucide-react"
import EmpleadosTable from "@/components/dashboard/empleados/empleados-table"
import { apiClient } from "@/lib/api-client"

export default function EmpleadosPage() {
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClient.getEmpleados()
        if (response.success && response.data) {
          const empleados = response.data
          setStats({
            total: empleados.length,
            activos: empleados.filter((e) => e.estado === "activo").length,
            inactivos: empleados.filter((e) => e.estado === "inactivo").length,
          })
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a3b5d]">Empleados</h1>
          <p className="text-muted-foreground">Gestiona el equipo de trabajo de tu barbería</p>
        </div>
        <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
          <Link href="/dashboard/empleados/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a3b5d]">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Personal registrado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
            <p className="text-xs text-muted-foreground">Trabajando actualmente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactivos}</div>
            <p className="text-xs text-muted-foreground">No disponibles</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1a3b5d]">Lista de Empleados</CardTitle>
          <CardDescription>Administra la información de tu equipo de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <EmpleadosTable />
        </CardContent>
      </Card>
    </div>
  )
}
