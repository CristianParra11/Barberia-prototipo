"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ClienteForm from "@/components/dashboard/clientes/cliente-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { apiClient, type Cliente } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function EditarClientePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCliente = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("ID de cliente inválido")
        setIsLoading(false)
        return
      }

      try {
        const response = await apiClient.getCliente(params.id)

        if (response.success && response.data) {
          setCliente(response.data)
        } else {
          setError(response.error || "Cliente no encontrado")
        }
      } catch (error) {
        console.error("Error al cargar cliente:", error)
        setError("Error de conexión")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCliente()
  }, [params.id])

  const handleSuccess = (clienteActualizado: Cliente) => {
    toast({
      title: "Cliente actualizado",
      description: `${clienteActualizado.nombre} ${clienteActualizado.apellido} ha sido actualizado correctamente.`,
    })
    router.push("/dashboard/clientes")
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3b5d]">Error</h1>
            <p className="text-gray-600">{error || "Cliente no encontrado"}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a clientes
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No se pudo cargar la información del cliente.</p>
          <Button asChild>
            <Link href="/dashboard/clientes">Volver a la lista de clientes</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Editar Cliente</h1>
          <p className="text-gray-600">
            Modificar información de {cliente.nombre} {cliente.apellido}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/clientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a clientes
          </Link>
        </Button>
      </div>

      <ClienteForm cliente={cliente} isEditing={true} onSuccess={handleSuccess} />
    </div>
  )
}
