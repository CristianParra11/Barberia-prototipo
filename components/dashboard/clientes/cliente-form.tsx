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
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient, type Cliente } from "@/lib/api-client"
import { ImageUpload } from "@/components/ui/image-upload"

// Esquema de validación basado en tu estructura de BD
const clienteSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Introduce un email válido" }).optional().or(z.literal("")),
  telefono: z.string().min(9, { message: "Introduce un número de teléfono válido" }),
  notas: z.string().optional().or(z.literal("")),
  foto: z.string().optional(),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: Cliente
  isEditing?: boolean
  onSuccess?: (cliente: Cliente) => void
  onCancel?: () => void
  isModal?: boolean
}

export default function ClienteForm({
  cliente,
  isEditing = false,
  onSuccess,
  onCancel,
  isModal = false,
}: ClienteFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formDataToSubmit, setFormDataToSubmit] = useState<ClienteFormValues | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null) // Declare setFotoFile variable

  // Valores por defecto basados en tu esquema
  const defaultValues: Partial<ClienteFormValues> = {
    nombre: cliente?.nombre || "",
    apellido: cliente?.apellido || "",
    email: cliente?.email || "",
    telefono: cliente?.telefono || "",
    notas: cliente?.notas || "",
    foto: cliente?.foto || "",
  }

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  })

  const onSubmit = async (data: ClienteFormValues) => {
    // Si es un modal, no mostramos confirmación para no interrumpir el flujo
    if (isModal) {
      handleConfirmedSubmit(data)
      return
    }

    // Mostrar diálogo de confirmación en lugar de enviar directamente
    setFormDataToSubmit(data)
    setShowConfirmDialog(true)
  }

  // Función para manejar la confirmación y enviar los datos
  const handleConfirmedSubmit = async (data: ClienteFormValues) => {
    if (!data && !formDataToSubmit) return

    const dataToSubmit = data || formDataToSubmit
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      // Preparar datos para enviar según tu esquema
      const clienteData = {
        nombre: dataToSubmit.nombre,
        apellido: dataToSubmit.apellido,
        email: dataToSubmit.email || "",
        telefono: dataToSubmit.telefono,
        notas: dataToSubmit.notas || "",
        foto: dataToSubmit.foto || null,
      }

      let response

      if (isEditing && cliente) {
        // Actualizar cliente existente
        response = await apiClient.updateCliente(cliente.id, clienteData)
      } else {
        // Crear nuevo cliente
        response = await apiClient.createCliente(clienteData)
      }

      if (response.success) {
        toast({
          title: isEditing ? "Cliente actualizado" : "Cliente creado",
          description:
            response.message ||
            `${dataToSubmit.nombre} ${dataToSubmit.apellido} ha sido ${isEditing ? "actualizado" : "añadido"} correctamente.`,
        })

        // Si hay una función de éxito, la llamamos
        if (onSuccess && response.data) {
          onSuccess(response.data)
        } else {
          // Redireccionar
          router.push("/dashboard/clientes")
          router.refresh()
        }
      } else {
        toast({
          title: "Error",
          description: response.error || "Ha ocurrido un error al guardar los datos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error)
      toast({
        title: "Error",
        description: "Error de conexión. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setFormDataToSubmit(null)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/dashboard/clientes")
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido *</FormLabel>
                  <FormControl>
                    <Input placeholder="Apellido" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@ejemplo.com" {...field} />
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
                  <FormLabel>Teléfono *</FormLabel>
                  <FormControl>
                    <Input placeholder="600 000 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="foto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => {
                      field.onChange(url)
                      setFotoFile(null) // Clear the file since ImageUpload handles it
                    }}
                    size="lg"
                    className="mx-auto"
                  />
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
                <FormLabel>Notas adicionales</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Preferencias del cliente, historial, etc..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                <>{isEditing ? "Actualizar cliente" : "Crear cliente"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {!isModal && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Actualizar cliente" : "Crear cliente"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "¿Estás seguro de que deseas guardar los cambios realizados en este cliente?"
                  : "¿Estás seguro de que deseas registrar este nuevo cliente?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => formDataToSubmit && handleConfirmedSubmit(formDataToSubmit)}
                className="bg-[#1a3b5d] hover:bg-[#2a4b6d]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  <>{isEditing ? "Confirmar actualización" : "Confirmar registro"}</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
