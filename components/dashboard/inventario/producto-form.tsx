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
import { Loader2, Package, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import ProveedorForm from "./proveedor-form"
import { apiClient, type Producto, type Proveedor } from "@/lib/api-client"
import { formatPrecio } from "@/lib/utils"

// Esquema de validación
const productoSchema = z.object({
  codigo: z.string().min(1, { message: "El código es obligatorio" }),
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  precio: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "El precio debe ser un número mayor o igual a 0",
  }),
  precioCompra: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "El precio de compra debe ser un número mayor o igual a 0",
  }),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "El stock debe ser un número mayor o igual a 0",
  }),
  stockMinimo: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "El stock mínimo debe ser un número mayor o igual a 0",
  }),
  categoria: z.enum([
    "Cuidado Capilar",
    "Cuidado Facial",
    "Cuidado de Barba",
    "Afeitado",
    "Styling",
    "Accesorios",
    "Perfumería",
  ] as [string, ...string[]]),
  genero: z.enum(["Hombre", "Mujer", "Unisex"] as [string, ...string[]]),
  marca: z.string().min(1, { message: "La marca es obligatoria" }),
  proveedorId: z.string().min(1, { message: "Selecciona un proveedor" }),
  destacado: z.boolean().default(false),
  estado: z.enum(["activo", "inactivo"]),
  imagen: z.any().optional(),
})

type ProductoFormValues = z.infer<typeof productoSchema>

interface ProductoFormProps {
  producto?: Producto
  isEditing?: boolean
}

export default function ProductoForm({ producto, isEditing = false }: ProductoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [showProveedorModal, setShowProveedorModal] = useState(false)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [isLoadingProveedores, setIsLoadingProveedores] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formDataToSubmit, setFormDataToSubmit] = useState<ProductoFormValues | null>(null)

  // Valores por defecto
  const defaultValues: Partial<ProductoFormValues> = {
    codigo: producto?.codigo || "",
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    precio: producto?.precio?.toString() || "",
    precioCompra: producto?.precio_compra?.toString() || "",
    stock: producto?.stock?.toString() || "",
    stockMinimo: producto?.stock_minimo?.toString() || "",
    categoria: producto?.categoria || "Cuidado Capilar",
    genero: producto?.genero || "Hombre",
    marca: producto?.marca || "",
    proveedorId: producto?.proveedor_id || "",
    destacado: producto?.destacado || false,
    estado: producto?.estado || "activo",
    imagen: producto?.imagen || null,
  }

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues,
  })

  // Efecto para actualizar el formulario cuando cambie el producto
  useEffect(() => {
    if (producto && isEditing) {
      console.log("Actualizando formulario con producto:", producto)
      form.reset({
        codigo: producto.codigo || "",
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio?.toString() || "",
        precioCompra: producto.precio_compra?.toString() || "",
        stock: producto.stock?.toString() || "",
        stockMinimo: producto.stock_minimo?.toString() || "",
        categoria: producto.categoria || "Cuidado Capilar",
        genero: producto.genero || "Hombre",
        marca: producto.marca || "",
        proveedorId: producto.proveedor_id || "",
        destacado: Boolean(producto.destacado),
        estado: producto.estado || "activo",
        imagen: producto.imagen || null,
      })
    }
  }, [producto, isEditing, form])

  const onSubmit = async (data: ProductoFormValues) => {
    // Mostrar diálogo de confirmación en lugar de enviar directamente
    setShowConfirmDialog(true)
    setFormDataToSubmit(data)
  }

  useEffect(() => {
    loadProveedores()
  }, [])

  // Función para cargar proveedores
  const loadProveedores = async () => {
    try {
      setIsLoadingProveedores(true)
      const response = await apiClient.getProveedores()

      if (response.success && response.data) {
        const proveedoresActivos = response.data.filter((p) => p.estado === "activo")
        setProveedores(proveedoresActivos)
      }
    } catch (error) {
      console.error("Error loading proveedores:", error)
    } finally {
      setIsLoadingProveedores(false)
    }
  }

  // Función para manejar la confirmación y enviar los datos
  const handleConfirmedSubmit = async () => {
    if (!formDataToSubmit) return

    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      console.log("Enviando datos del formulario:", formDataToSubmit)

      // Preparar datos para enviar
      const productoData = {
        codigo: formDataToSubmit.codigo,
        nombre: formDataToSubmit.nombre,
        descripcion: formDataToSubmit.descripcion,
        precio: Number(formDataToSubmit.precio),
        precio_compra: Number(formDataToSubmit.precioCompra),
        stock: Number(formDataToSubmit.stock),
        stock_minimo: Number(formDataToSubmit.stockMinimo),
        categoria: formDataToSubmit.categoria,
        genero: formDataToSubmit.genero,
        marca: formDataToSubmit.marca,
        proveedor_id: formDataToSubmit.proveedorId,
        destacado: formDataToSubmit.destacado,
        estado: formDataToSubmit.estado,
        imagen: formDataToSubmit.imagen,
      }

      console.log("Datos preparados para enviar:", productoData)

      let response
      if (isEditing && producto?.id) {
        console.log("Actualizando producto con ID:", producto.id)
        response = await apiClient.updateProducto(producto.id, productoData)
      } else {
        console.log("Creando nuevo producto")
        response = await apiClient.createProducto(productoData)
      }

      console.log("Respuesta de la API:", response)

      if (response.success) {
        toast({
          title: isEditing ? "Producto actualizado" : "Producto creado",
          description:
            response.message ||
            `${formDataToSubmit.nombre} ha sido ${isEditing ? "actualizado" : "añadido"} correctamente.`,
        })

        // Redirigir después de un breve delay para mostrar el toast
        setTimeout(() => {
          router.push("/dashboard/inventario")
          router.refresh()
        }, 1000)
      } else {
        throw new Error(response.error || "Error al guardar el producto")
      }
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al guardar los datos.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calcular margen de beneficio
  const calcularMargen = (): string => {
    const precio = Number(form.watch("precio"))
    const precioCompra = Number(form.watch("precioCompra"))

    if (precio <= 0 || precioCompra <= 0) return "0.00%"
    const margen = ((precio - precioCompra) / precio) * 100
    return `${margen.toFixed(2)}%`
  }

  // Manejar la creación de un nuevo proveedor
  const handleProveedorCreated = async (nuevoProveedor: Proveedor) => {
    // Recargar la lista de proveedores
    await loadProveedores()

    // Seleccionar automáticamente el nuevo proveedor
    form.setValue("proveedorId", nuevoProveedor.id)

    // Cerrar el modal
    setShowProveedorModal(false)

    // Mostrar notificación
    toast({
      title: "Proveedor creado",
      description: `${nuevoProveedor.nombre} ha sido añadido como proveedor.`,
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="PROD001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Champú profesional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Marca del producto" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          "Cuidado Capilar",
                          "Cuidado Facial",
                          "Cuidado de Barba",
                          "Afeitado",
                          "Styling",
                          "Accesorios",
                          "Perfumería",
                        ].map((categoria) => (
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
                name="genero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Hombre", "Mujer", "Unisex"].map((genero) => (
                          <SelectItem key={genero} value={genero}>
                            {genero}
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
                name="imagen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen del producto</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <div className="h-24 w-24 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
                          {field.value ? (
                            <img
                              src={field.value || "/placeholder.svg"}
                              alt="Imagen del producto"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#e6f0f9] text-[#1a3b5d]">
                              <Package className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setImagenFile(file)
                                field.onChange(URL.createObjectURL(file))
                              }
                            }}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF. Máximo 5MB.</p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="precioCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de compra (COP)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1000" placeholder="10000" {...field} />
                      </FormControl>
                      <FormDescription>Precio al que se compra al proveedor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de venta (COP)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1000" placeholder="15000" {...field} />
                      </FormControl>
                      <FormDescription>Precio al que se vende al cliente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {Number(form.watch("precio")) > 0 && Number(form.watch("precioCompra")) > 0 && (
                <div className="rounded-md bg-[#e6f0f9] p-3 text-[#1a3b5d]">
                  <p className="font-medium">Margen de beneficio: {calcularMargen()}</p>
                  <p className="text-sm">
                    Beneficio por unidad:{" "}
                    {formatPrecio(Number(form.watch("precio")) - Number(form.watch("precioCompra")))}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock actual</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockMinimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock mínimo</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" placeholder="5" {...field} />
                      </FormControl>
                      <FormDescription>Cantidad mínima antes de reabastecimiento</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="proveedorId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Proveedor</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProveedorModal(true)}
                        className="h-8 px-2 text-[#1a3b5d]"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Nuevo proveedor
                      </Button>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger id="proveedor-selector">
                          <SelectValue placeholder="Selecciona un proveedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proveedores.map((proveedor) => (
                          <SelectItem key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormLabel className="text-base">Producto destacado</FormLabel>
                      <FormDescription>Mostrar este producto en secciones destacadas</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe el producto en detalle..." className="min-h-[120px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/inventario")}
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
                <>{isEditing ? "Actualizar producto" : "Crear producto"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal para crear nuevo proveedor */}
      <Dialog open={showProveedorModal} onOpenChange={setShowProveedorModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a3b5d]">Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Añade un nuevo proveedor para tus productos. El proveedor se seleccionará automáticamente al guardar.
            </DialogDescription>
          </DialogHeader>
          <ProveedorForm onSuccess={handleProveedorCreated} isModal={true} />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Actualizar producto" : "Crear producto"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "¿Estás seguro de que deseas guardar los cambios realizados en este producto?"
                : "¿Estás seguro de que deseas registrar este nuevo producto?"}
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
    </>
  )
}
