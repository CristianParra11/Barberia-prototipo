"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProveedorForm from "@/components/dashboard/inventario/proveedor-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, type Proveedor } from "@/lib/api-client"

export default function EditarProveedorPage({ params }: { params: { id: string } }) {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const cargarProveedor = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getProveedor(params.id)

        if (response.success && response.data) {
          setProveedor(response.data)
        } else {
          throw new Error(response.error || "Proveedor no encontrado")
        }
      } catch (error) {
        console.error("Error cargando proveedor:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del proveedor",
          variant: "destructive",
        })
        router.push("/dashboard/proveedores")
      } finally {
        setIsLoading(false)
      }
    }

    cargarProveedor()
  }, [params.id, router, toast])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200"></div>
            <div className="mt-2 h-5 w-96 animate-pulse rounded-md bg-gray-200"></div>
          </div>
          <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200"></div>
        </div>

        <div className="max-w-2xl">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200"></div>
                  <div className="h-10 w-full animate-pulse rounded-md bg-gray-200"></div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded-md bg-gray-200"></div>
              <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"></div>
            </div>
            <div className="flex justify-end space-x-4">
              <div className="h-10 w-24 animate-pulse rounded-md bg-gray-200"></div>
              <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Proveedor no encontrado</h2>
          <p className="mt-2 text-gray-600">El proveedor que intentas editar no existe o ha sido eliminado.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/proveedores">Volver a proveedores</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3b5d]">Editar Proveedor</h1>
          <p className="text-gray-600">Modificar información de {proveedor.nombre}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/proveedores/${proveedor.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al detalle
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl">
        <ProveedorForm proveedor={proveedor} isEditing={true} />
      </div>
    </div>
  )
}
