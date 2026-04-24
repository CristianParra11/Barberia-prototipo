"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { apiClient, type Empleado } from "@/lib/api-client"
import { puestos, especialidades } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImageUpload } from "@/components/ui/image-upload"

// Esquema de validación
const empleadoSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Introduce un email válido" }),
  telefono: z.string().min(9, { message: "Introduce un número de teléfono válido" }),
  puesto: z.string().min(1, { message: "Selecciona un puesto" }),
  fecha_contratacion: z.string().min(1, { message: "Selecciona una fecha" }),
  estado: z.enum(["activo", "inactivo"]),
  especialidades: z.array(z.string()).min(1, { message: "Selecciona al menos una especialidad" }),
  foto: z.string().optional(),
})

type EmpleadoFormValues = z.infer<typeof empleadoSchema>

interface EmpleadoFormProps {
  empleado?: Empleado
  isEditing?: boolean
}

export default function EmpleadoForm({ empleado, isEditing = false }: EmpleadoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formDataToSubmit, setFormDataToSubmit] = useState<EmpleadoFormValues | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Valores por defecto
  const defaultValues: Partial<EmpleadoFormValues> = {
    nombre: empleado?.nombre || "",
    apellido: empleado?.apellido || "",
    email: empleado?.email || "",
    telefono: empleado?.telefono || "",
    puesto: empleado?.puesto || "",
    fecha_contratacion: empleado?.fecha_contratacion || new Date().toISOString().split("T")[0],
    estado: empleado?.estado || "activo",
    especialidades: empleado?.especialidades || [],
    foto: empleado?.foto || "",
  }

  const form = useForm<EmpleadoFormValues>({
    resolver: zodResolver(empleadoSchema),
    defaultValues,
  })

  const onSubmit = async (data: EmpleadoFormValues) => {
    setShowConfirmDialog(true)
    setFormDataToSubmit(data)
  }

  const handleConfirmedSubmit = async () => {
    if (!formDataToSubmit) return

    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      let response
      if (isEditing && empleado) {
        response = await apiClient.updateEmpleado(empleado.id, formDataToSubmit)
      } else {
        response = await apiClient.createEmpleado(formDataToSubmit)
      }

      if (response.success) {
        toast({
          title: isEditing ? "Empleado actualizado" : "Empleado creado",
          description:
            response.message ||
            `${formDataToSubmit.nombre} ${formDataToSubmit.apellido} ha sido ${isEditing ? "actualizado" : "añadido"} correctamente.`,
        })
        router.push("/dashboard/empleados")
      } else {
        toast({
          title: "Error",
          description: response.error || "Ha ocurrido un error al guardar los datos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al guardar empleado:", error)
      toast({
        title: "Error",
        description: "Error de conexión. Inténtalo de nuevo.",
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
                <FormLabel>Nombre</FormLabel>
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
                <FormLabel>Apellido</FormLabel>
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
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="600 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="puesto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puesto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un puesto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {puestos.map((puesto) => (
                      <SelectItem key={puesto} value={puesto}>
                        {puesto}
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
            name="fecha_contratacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de contratación</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
        </div>

        <FormField
          control={form.control}
          name="foto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value || ""}
                  onChange={(url) => field.onChange(url)}
                  onUploading={setIsUploading}
                  uploadType="empleado"
                  shape="circle"
                  className="h-24 w-24"
                />
              </FormControl>
              <FormDescription className="text-xs text-gray-500">JPG, PNG o GIF. Máximo 5MB.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="especialidades"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Especialidades</FormLabel>
                <FormDescription>
                  Selecciona las especialidades en las que este empleado está capacitado
                </FormDescription>
                <FormMessage />
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {especialidades.map((especialidad) => (
                  <FormField
                    key={especialidad}
                    control={form.control}
                    name="especialidades"
                    render={({ field }) => {
                      return (
                        <FormItem key={especialidad} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(especialidad)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, especialidad])
                                  : field.onChange(field.value?.filter((value) => value !== especialidad))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{especialidad}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/empleados")}
            disabled={isSubmitting || isUploading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading} className="bg-[#1a3b5d] hover:bg-[#2a4b6d]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo imagen...
              </>
            ) : (
              <>{isEditing ? "Actualizar empleado" : "Crear empleado"}</>
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Actualizar empleado" : "Crear empleado"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "¿Estás seguro de que deseas guardar los cambios realizados en este empleado?"
                : "¿Estás seguro de que deseas registrar este nuevo empleado?"}
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
