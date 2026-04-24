"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { apiClient, type Proveedor } from "@/lib/api-client"

// Esquema de validación
const proveedorSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  contacto: z.string().min(2, { message: "El contacto debe tener al menos 2 caracteres" }),
  telefono: z.string().min(10, { message: "El teléfono debe tener al menos 10 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  estado: z.enum(["activo", "inactivo"]),
})

type ProveedorFormValues = z.infer<typeof proveedorSchema>

interface ProveedorFormProps {
  proveedor?: Proveedor
  isEditing?: boolean
  onSuccess?: (proveedor: Proveedor) => void
  isModal?: boolean
}

export default function ProveedorForm({
  proveedor,
  isEditing = false,
  onSuccess,
  isModal = false,
}: ProveedorFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Valores por defecto
  const defaultValues: Partial<ProveedorFormValues> = {
    nombre: proveedor?.nombre || "",
    contacto: proveedor?.contacto || "",
    telefono: proveedor?.telefono || "",
    email: proveedor?.email || "",
    direccion: proveedor?.direccion || "",
    notas: proveedor?.notas || "",
    estado: proveedor?.estado || "activo",
  }

  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorSchema),
    defaultValues,
  })

  const onSubmit = async (data: ProveedorFormValues) => {
    setIsSubmitting(true)

    try {
      // Preparar datos para enviar
      const proveedorData = {
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email || null,
        direccion: data.direccion || null,
        notas: data.notas || null,
        estado: data.estado,
      }

      let response
      if (isEditing && proveedor?.id) {
        response = await apiClient.updateProveedor(proveedor.id, proveedorData)
      } else {
        response = await apiClient.createProveedor(proveedorData)
      }

      if (response.success) {
        toast({
          title: isEditing ? "Proveedor actualizado" : "Proveedor creado",
          description:
            response.message || `${data.nombre} ha sido ${isEditing ? "actualizado" : "añadido"} correctamente.`,
        })

        if (onSuccess && response.data) {
          onSuccess(response.data)
        } else if (!isModal) {
          router.push("/dashboard/inventario")
        }
      } else {
        throw new Error(response.error || "Error al guardar el proveedor")
      }
    } catch (error) {
      console.error("Error al guardar proveedor:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al guardar los datos.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del proveedor</FormLabel>
                <FormControl>
                  <Input placeholder="Distribuidora ABC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona de contacto</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="555-123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (opcional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contacto@proveedor.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Calle Principal 123, Ciudad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre el proveedor..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {!isModal && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/inventario")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>{isEditing ? "Actualizar proveedor" : "Crear proveedor"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
