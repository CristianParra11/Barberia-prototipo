import ProveedoresLista from "@/components/dashboard/inventario/proveedores-lista"

export default function ProveedoresPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a3b5d]">Gestión de Proveedores</h1>
        <p className="text-gray-600">Administra los proveedores de productos para la barbería</p>
      </div>

      <ProveedoresLista />
    </div>
  )
}
