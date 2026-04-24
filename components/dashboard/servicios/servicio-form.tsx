"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { categorias } from "@/lib/data"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Esquema de validación
const servicioSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  precio: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "El precio debe ser un número mayor que 0",
  }),
  duracion: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "La duración debe ser un número mayor que 0",
  }),
  categoria: z.enum(categorias as [string, ...string[]]),
  destacado: z.boolean().default(false),
  estado: z.enum(["activo", "inactivo"]),
  imagen: z.string().optional(),
})

type ServicioFormValues = z.infer<typeof servicioSchema>

interface ServicioFormProps {
  servicioId?: string
  isEditing?: boolean
}

export default function ServicioForm({ servicioId, isEditing = false }: ServicioFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formDataToSubmit, setFormDataToSubmit] = useState<ServicioFormValues | null>(null)

  // Valores por defecto
  const defaultValues: Partial<ServicioFormValues> = {
    nombre: "",
    descripcion: "",
    precio: "",
    duracion: "",
    categoria: categorias[0],
    destacado: false,
    estado: "activo",
    imagen: "",
  }

  const form = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema),
    defaultValues,
  })

  // Cargar datos del servicio si estamos editando
  useEffect(() => {
    if (isEditing && servicioId) {
      loadServicio()
    }
  }, [isEditing, servicioId])

  const loadServicio = async () => {
    if (!servicioId) return

    setIsLoading(true)
    try {
      const response = await apiClient.getServicio(servicioId)
      if (response.success && response.data) {
        const servicio = response.data
        form.reset({
          nombre: servicio.nombre,
          descripcion: servicio.descripcion || "",
          precio: servicio.precio.toString(),
          duracion: servicio.duracion.toString(),
          categoria: servicio.categoria as any,
          destacado: servicio.destacado,
          estado: servicio.estado,
          imagen: servicio.imagen || "",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo cargar el servicio",
          variant: "destructive",
        })
        router.push("/dashboard/servicios")
      }
    } catch (error) {
      console.error("Error al cargar servicio:", error)
      toast({
        title: "Error",
        description: "Error de conexión al cargar el servicio",
        variant: "destructive",
      })
      router.push("/dashboard/servicios")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ServicioFormValues) => {
    setShowConfirmDialog(true)
    setFormDataToSubmit(data)
  }

  const handleConfirmedSubmit = async () => {
    if (!formDataToSubmit) return

    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      const servicioData = {
        nombre: formDataToSubmit.nombre,
        descripcion: formDataToSubmit.descripcion,
        precio: Number(formDataToSubmit.precio),
        duracion: Number(formDataToSubmit.duracion),
        categoria: formDataToSubmit.categoria,
        destacado: formDataToSubmit.destacado,
        estado: formDataToSubmit.estado,
        imagen: formDataToSubmit.imagen || null,
      }

      let response
      if (isEditing && servicioId) {
        response = await apiClient.updateServicio(servicioId, servicioData)
      } else {
        response = await apiClient.createServicio(servicioData)
      }

      if (response.success) {
        toast({
          title: isEditing ? "Servicio actualizado" : "Servicio creado",
          description: `${formDataToSubmit.nombre} ha sido ${isEditing ? "actualizado" : "creado"} correctamente.`,
        })
        router.push("/dashboard/servicios")
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo guardar el servicio",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar servicio:", error)
      toast({
        title: "Error",
        description: "Error de conexión al guardar el servicio",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando servicio...</span>
      </div>
    )
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
                <FormLabel>Nombre del servicio</FormLabel>
                <FormControl>
                  <Input placeholder="Corte de pelo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (COP)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1000" placeholder="15000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duracion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (minutos)</FormLabel>
                <FormControl>
                  <Input type="number" min="5" step="5" placeholder="30" {...field} />
                </FormControl>
                <FormDescription>Tiempo estimado para realizar el servicio</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange as (value: string) => void} defaultValue={field.value}>
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

          <FormField
            control={form.control}
            name="destacado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Servicio destacado</FormLabel>
                  <FormDescription>Mostrar este servicio en secciones destacadas</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imagen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen del servicio</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} size="lg" className="max-w-xs" />
              </FormControl>
              <FormDescription>
                Sube una imagen representativa del servicio. Formatos: JPG, PNG, GIF. Máximo 5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe el servicio en detalle..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/servicios")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>{isEditing ? "Actualizar servicio" : "Crear servicio"}</>
            )}
          </Button>
        </div>
      </form>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Actualizar servicio" : "Crear servicio"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "¿Estás seguro de que deseas guardar los cambios realizados en este servicio?"
                : "¿Estás seguro de que deseas registrar este nuevo servicio?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmedSubmit} className="bg-[#1a3b5d] hover:bg-[#2a4b6d]" disabled={isSubmitting}>
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
    </Form>
  )
}
