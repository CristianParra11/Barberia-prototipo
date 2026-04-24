import ProveedorDetalle from "@/components/dashboard/inventario/proveedor-detalle"

export default function ProveedorPage({ params }: { params: { id: string } }) {
  return <ProveedorDetalle proveedorId={params.id} />
}
