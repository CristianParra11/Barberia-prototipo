"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye, Search, Calendar, Plus, RefreshCw } from "lucide-react"
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
import { apiClient, type Cliente } from "@/lib/api-client"

export default function ClientesLista() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getClientes(searchTerm)

      if (response.success && response.data) {
        setClientes(response.data)
      } else {
        setError(response.error || "Error al cargar clientes")
      }
    } catch (error) {
      setError("Error de conexión")
      console.error("Error loading clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar cuando cambie el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        loadClientes()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente)
  }

  const confirmDelete = async () => {
    if (clienteToDelete) {
      try {
        const response = await apiClient.deleteCliente(clienteToDelete.id)

        if (response.success) {
          setClientes(clientes.filter((c) => c.id !== clienteToDelete.id))
          toast({
            title: "Cliente eliminado",
            description: `${clienteToDelete.nombre} ${clienteToDelete.apellido} ha sido eliminado correctamente.`,
          })
        } else {
          toast({
            variant: "destructive",
            title: "No se puede eliminar",
            description: response.error || "Error al eliminar el cliente",
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error de conexión al eliminar el cliente",
        })
      }

      setClienteToDelete(null)
    }
  }

  // Formatear fecha
  const formatFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3b5d] mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadClientes} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={loadClientes} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button asChild className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            <Link href="/dashboard/clientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {searchTerm ? "No se encontraron clientes con ese criterio" : "No hay clientes registrados"}
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        {cliente.foto ? (
                          <Image
                            src={cliente.foto || "/placeholder.svg"}
                            alt={`${cliente.nombre} ${cliente.apellido}`}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#e6f0f9] text-[#1a3b5d] text-sm font-medium">
                            {cliente.nombre.charAt(0)}
                            {cliente.apellido.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {cliente.nombre} {cliente.apellido}
                        </p>
                        <p className="text-xs text-gray-500">{cliente.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cliente.telefono}</p>
                      {cliente.notas && <p className="text-xs text-gray-500 truncate max-w-[200px]">{cliente.notas}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{formatFecha(cliente.fecha_registro)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver detalles">
                        <Link href={`/dashboard/clientes/${cliente.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Editar">
                        <Link href={`/dashboard/clientes/${cliente.id}/editar`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Programar cita">
                        <Link href={`/dashboard/citas/nueva?cliente=${cliente.id}`}>
                          <Calendar className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(cliente)}
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

      <Dialog open={!!clienteToDelete} onOpenChange={(open) => !open && setClienteToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al cliente "{clienteToDelete?.nombre} {clienteToDelete?.apellido}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClienteToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
