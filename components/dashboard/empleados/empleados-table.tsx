"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, type Empleado } from "@/lib/api-client"

export default function EmpleadosTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoToDelete, setEmpleadoToDelete] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  // Cargar empleados
  const loadEmpleados = async (search?: string) => {
    try {
      setLoading(true)
      const response = await apiClient.getEmpleados(search)

      if (response.success && response.data) {
        setEmpleados(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al cargar empleados",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar empleados al montar el componente
  useEffect(() => {
    loadEmpleados()
  }, [])

  // Buscar empleados cuando cambia el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmpleados(searchTerm || undefined)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDeleteClick = (empleado: Empleado) => {
    setEmpleadoToDelete(empleado)
  }

  const confirmDelete = async () => {
    if (!empleadoToDelete) return

    try {
      setDeleting(true)
      const response = await apiClient.deleteEmpleado(empleadoToDelete.id)

      if (response.success) {
        toast({
          title: "Empleado eliminado",
          description: response.message || "Empleado eliminado correctamente",
        })

        // Recargar la lista
        await loadEmpleados(searchTerm || undefined)
      } else {
        toast({
          title: "Error",
          description: response.error || "Error al eliminar empleado",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setEmpleadoToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando empleados...</span>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar empleados..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Puesto</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron empleados
                </TableCell>
              </TableRow>
            ) : (
              empleados.map((empleado) => (
                <TableRow key={empleado.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        {empleado.foto ? (
                          <Image
                            src={empleado.foto || "/placeholder.svg"}
                            alt={`${empleado.nombre} ${empleado.apellido}`}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d]">
                            {empleado.nombre.charAt(0)}
                            {empleado.apellido.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {empleado.nombre} {empleado.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{empleado.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{empleado.puesto}</TableCell>
                  <TableCell>{empleado.telefono}</TableCell>
                  <TableCell>
                    <Badge
                      variant={empleado.estado === "activo" ? "default" : "secondary"}
                      className={
                        empleado.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {empleado.estado === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver detalles">
                        <Link href={`/dashboard/empleados/${empleado.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                        <Link href={`/dashboard/empleados/${empleado.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(empleado)}
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

      <Dialog open={!!empleadoToDelete} onOpenChange={(open) => !open && setEmpleadoToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {empleadoToDelete?.nombre} {empleadoToDelete?.apellido}? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmpleadoToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
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
    </>
  )
}
