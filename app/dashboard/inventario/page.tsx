import { Suspense } from "react"
import InventarioDashboard from "@/components/dashboard/inventario/inventario-dashboard"
import ProductosLista from "@/components/dashboard/inventario/productos-lista"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventarioPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a3b5d]">Inventario</h1>
        <p className="text-gray-600">Gestiona productos, proveedores y stock</p>
      </div>

      <Tabs defaultValue="productos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3b5d]"></div>
              </div>
            }
          >
            <ProductosLista />
          </Suspense>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3b5d]"></div>
              </div>
            }
          >
            <InventarioDashboard />
          </Suspense>
        </TabsContent>

      
      </Tabs>
    </div>
  )
}
