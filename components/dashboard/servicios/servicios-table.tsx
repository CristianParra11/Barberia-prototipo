"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, Search, Star, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient, type Servicio } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { formatPrecio } from "@/lib/data"

export default function ServiciosTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [servicioToDelete, setServicioToDelete] = useState<Servicio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar servicios desde la API
  const loadServicios = async (search?: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.getServicios(search)
      if (response.success && response.data) {
        setServicios(response.data)
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudieron cargar los servicios",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al cargar servicios:", error)
      toast({
        title: "Error",
        description: "Error de conexión al cargar servicios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServicios()
  }, [])

  // Buscar servicios cuando cambie el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadServicios(searchTerm || undefined)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDeleteClick = (servicio: Servicio) => {
    setServicioToDelete(servicio)
  }

  const confirmDelete = async () => {
    if (!servicioToDelete) return

    setIsDeleting(true)
    try {
      const response = await apiClient.deleteServicio(servicioToDelete.id)

      if (response.success) {
        toast({
          title: "Servicio eliminado",
          description: `${servicioToDelete.nombre} ha sido eliminado correctamente.`,
        })

        // Recargar la lista
        await loadServicios(searchTerm || undefined)
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo eliminar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar servicio:", error)
      toast({
        title: "Error",
        description: "Error de conexión al eliminar servicio",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setServicioToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando servicios...</span>
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
            placeholder="Buscar servicios..."
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
              <TableHead>Servicio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? "No se encontraron servicios" : "No hay servicios registrados"}
                </TableCell>
              </TableRow>
            ) : (
              servicios.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md">
                        {servicio.imagen ? (
                          <Image
                            src={servicio.imagen || "/placeholder.svg"}
                            alt={servicio.nombre}
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
                          className={`flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d] ${servicio.imagen ? "hidden" : ""}`}
                        >
                          {servicio.nombre.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{servicio.nombre}</p>
                          {servicio.destacado && <Star className="ml-1 h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{servicio.descripcion}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-[#e6f0f9] text-[#1a3b5d]">
                      {servicio.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrecio(servicio.precio)}</TableCell>
                  <TableCell>{servicio.duracion} min</TableCell>
                  <TableCell>
                    <Badge
                      variant={servicio.estado === "activo" ? "default" : "secondary"}
                      className={
                        servicio.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {servicio.estado === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver detalles">
                        <Link href={`/dashboard/servicios/${servicio.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                        <Link href={`/dashboard/servicios/${servicio.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(servicio)}
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

      <Dialog open={!!servicioToDelete} onOpenChange={(open) => !open && setServicioToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el servicio "{servicioToDelete?.nombre}"? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServicioToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
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
