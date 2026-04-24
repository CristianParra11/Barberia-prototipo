"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, Search, Plus, Loader2 } from "lucide-react"
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
import { apiClient, type Proveedor } from "@/lib/api-client"

export default function ProveedoresLista() {
  const [searchTerm, setSearchTerm] = useState("")
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar proveedores
  const cargarProveedores = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getProveedores(searchTerm)

      if (response.success && response.data) {
        setProveedores(response.data)
      } else {
        throw new Error(response.error || "Error al cargar proveedores")
      }
    } catch (error) {
      console.error("Error cargando proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar proveedores al montar el componente
  useEffect(() => {
    cargarProveedores()
  }, [])

  // Buscar proveedores cuando cambie el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarProveedores()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDeleteClick = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor)
  }

  const confirmDelete = async () => {
    if (!proveedorToDelete) return

    setIsDeleting(true)
    try {
      const response = await apiClient.deleteProveedor(proveedorToDelete.id)

      if (response.success) {
        toast({
          title: "Proveedor eliminado",
          description: response.message || `${proveedorToDelete.nombre} ha sido eliminado correctamente.`,
        })

        // Recargar la lista
        await cargarProveedores()
      } else {
        throw new Error(response.error || "Error al eliminar proveedor")
      }
    } catch (error) {
      console.error("Error eliminando proveedor:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el proveedor",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setProveedorToDelete(null)
    }
  }

  // Filtrar proveedores localmente para búsqueda instantánea
  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    if (!searchTerm) return true

    const searchString = `
      ${proveedor.nombre} 
      ${proveedor.contacto} 
      ${proveedor.email || ""} 
      ${proveedor.telefono} 
      ${proveedor.direccion || ""}
    `.toLowerCase()

    return searchString.includes(searchTerm.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200"></div>
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
            <p className="mt-2 text-gray-500">Cargando proveedores...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar proveedores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
          <Link href="/dashboard/proveedores/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proveedoresFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? "No se encontraron proveedores" : "No hay proveedores registrados"}
                </TableCell>
              </TableRow>
            ) : (
              proveedoresFiltrados.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell>
                    <div className="font-medium">{proveedor.nombre}</div>
                    {proveedor.direccion && <div className="text-sm text-gray-500">{proveedor.direccion}</div>}
                  </TableCell>
                  <TableCell>{proveedor.contacto}</TableCell>
                  <TableCell>{proveedor.telefono}</TableCell>
                  <TableCell>{proveedor.email || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={proveedor.estado === "activo" ? "default" : "secondary"}
                      className={
                        proveedor.estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {proveedor.estado === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver detalles">
                        <Link href={`/dashboard/proveedores/${proveedor.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                        <Link href={`/dashboard/proveedores/${proveedor.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(proveedor)}
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

      <Dialog open={!!proveedorToDelete} onOpenChange={(open) => !open && setProveedorToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el proveedor "{proveedorToDelete?.nombre}"?
              {proveedorToDelete?.estado === "activo" && (
                <span className="block mt-2 text-amber-600">
                  Si este proveedor tiene productos asociados, será desactivado en lugar de eliminado.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProveedorToDelete(null)} disabled={isDeleting}>
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
